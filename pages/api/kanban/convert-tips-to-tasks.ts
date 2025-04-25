import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from 'redis';
import { BlobServiceClient } from '@azure/storage-blob';
import { getAuth } from '@clerk/nextjs/server';

// Redis client configuration
const getRedisClient = () => {
  return createClient({
    url: process.env.AZURE_REDIS_CONNECTION_STRING,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('Redis reconnect attempts exceeded');
          return new Error('Redis reconnect attempts exceeded');
        }
        return Math.min(retries * 50, 1000);
      },
      connectTimeout: 10000, // 10 seconds
    }
  });
};

interface Tip {
  category: string;
  tips: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  dueDate: string | null;
  completedAt: string | null;
  category: string;
}

interface BoardData {
  tasks: { [key: string]: Task };
  columns: {
    [key: string]: {
      id: string;
      title: string;
      taskIds: string[];
    }
  };
  columnOrder: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tips } = req.body;
    
    // Get authenticated user if Clerk is enabled
    const auth = getAuth(req);
    const userId = auth?.userId || 'anonymous-user';
    
    if (!tips || !Array.isArray(tips)) {
      return res.status(400).json({ error: 'Tips array is required' });
    }
    
    // Create tasks from tips, excluding strengths
    const tasks: Task[] = [];
    const currentDate = new Date().toISOString();
    
    // Set due date to 2 weeks from now by default
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const dueDateStr = dueDate.toISOString();
    
    tips.forEach((category: Tip) => {
      // Skip the "Current Strengths" category as these are not actionable tasks
      if (category.category === "Current Strengths" || 
          category.category === "Brutally Honest Advice") {
        return;
      }
      
      // Convert each tip in the category to a task
      category.tips.forEach((tip: string) => {
        const priority = 
          category.category.includes("Skills") ? "high" : 
          category.category.includes("Courses") ? "medium" : "low";
          
        tasks.push({
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: tip.length > 50 ? tip.substring(0, 50) + '...' : tip,
          description: tip,
          status: 'todo',
          priority: priority, // Dynamic priority based on category
          createdAt: currentDate,
          dueDate: dueDateStr,
          completedAt: null,
          category: category.category
        });
      });
    });
    
    if (tasks.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No actionable tasks were created',
        tasksCreated: 0 
      });
    }
    
    // Connect to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING || ''
    );
    
    // Get container client
    const containerName = 'kanban-data';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Create container if it doesn't exist
    await containerClient.createIfNotExists();
    
    // Get blob client
    const blobName = `${userId}/board-data.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Initialize board data
    let boardData: BoardData = {
      tasks: {},
      columns: {
        'column-1': {
          id: 'column-1',
          title: 'To Do',
          taskIds: []
        },
        'column-2': {
          id: 'column-2',
          title: 'In Progress',
          taskIds: []
        },
        'column-3': {
          id: 'column-3',
          title: 'Done',
          taskIds: []
        }
      },
      columnOrder: ['column-1', 'column-2', 'column-3']
    };
    
    // Check if blob exists and download current board data
    const blobExists = await blockBlobClient.exists();
    if (blobExists) {
      const downloadResponse = await blockBlobClient.download(0);
      const downloaded = await streamToString(downloadResponse.readableStreamBody);
      boardData = JSON.parse(downloaded);
    }
    
    // Add new tasks to board data
    tasks.forEach(task => {
      boardData.tasks[task.id] = task;
      boardData.columns['column-1'].taskIds.push(task.id);
    });
    
    // Upload updated board data to Azure Blob Storage
    const data = JSON.stringify(boardData);
    await blockBlobClient.upload(data, data.length);
    
    // Also store tasks in Redis for backward compatibility
    const redisClient = getRedisClient();
    
    try {
      await redisClient.connect();
      
      // Get existing tasks if any
      const existingTasksJson = await redisClient.get('kanban_tasks') || '[]';
      const existingTasks = JSON.parse(existingTasksJson);
      
      // Combine existing tasks with new tasks
      const allTasks = [...existingTasks, ...tasks];
      
      // Store updated tasks
      await redisClient.set('kanban_tasks', JSON.stringify(allTasks));
      
    } catch (redisError) {
      console.error('Redis error:', redisError);
      // Continue even if Redis fails since we've stored in Azure
    } finally {
      if (redisClient.isOpen) {
        await redisClient.disconnect();
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Tips converted to tasks successfully',
      tasksCreated: tasks.length 
    });
  } catch (error) {
    console.error('Error converting tips to tasks:', error);
    return res.status(500).json({ error: 'Error converting tips to tasks' });
  }
}

// Helper function to convert stream to string
async function streamToString(readableStream: NodeJS.ReadableStream | undefined): Promise<string> {
  if (!readableStream) {
    return '';
  }
  
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on('data', (data) => {
      chunks.push(Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    readableStream.on('error', reject);
  });
}