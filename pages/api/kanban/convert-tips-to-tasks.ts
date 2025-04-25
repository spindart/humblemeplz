import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { BlobServiceClient } from '@azure/storage-blob';

interface Tip {
  category: string;
  tips: string[];
}

interface Task {
  id: string;
  content: string;
  category: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get authenticated user
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { tips } = req.body as { tips: Tip[] };
    
    if (!tips || !Array.isArray(tips)) {
      return res.status(400).json({ error: 'Invalid tips data' });
    }
    
    // Connect to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING || ''
    );
    
    // Get container client
    const containerName = 'kanban-data';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    
    // Get blob client
    const blobName = `${userId}/board-data.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Initialize board data
    let boardData: any = {
      tasks: {},
      columns: {
        'column-1': {
          id: 'column-1',
          title: 'To Do',
          taskIds: [],
        },
        'column-2': {
          id: 'column-2',
          title: 'Doing',
          taskIds: [],
        },
        'column-3': {
          id: 'column-3',
          title: 'Done',
          taskIds: [],
        },
      },
      columnOrder: ['column-1', 'column-2', 'column-3'],
    };
    
    // Check if board data already exists
    const blobExists = await blockBlobClient.exists();
    if (blobExists) {
      // Download existing board data
      const downloadResponse = await blockBlobClient.download(0);
      const downloaded = await streamToString(downloadResponse.readableStreamBody);
      boardData = JSON.parse(downloaded);
    }
    
    // Convert tips to tasks
    const newTasks: { [key: string]: Task } = {};
    const newTaskIds: string[] = [];
    
    tips.forEach(category => {
      category.tips.forEach(tip => {
        const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        newTasks[taskId] = {
          id: taskId,
          content: tip,
          category: category.category,
        };
        newTaskIds.push(taskId);
      });
    });
    
    // Update board data
    boardData.tasks = {
      ...boardData.tasks,
      ...newTasks,
    };
    
    boardData.columns['column-1'].taskIds = [
      ...boardData.columns['column-1'].taskIds,
      ...newTaskIds,
    ];
    
    // Upload updated board data
    const data = JSON.stringify(boardData);
    await blockBlobClient.upload(data, data.length);
    
    res.status(200).json({ success: true, tasksAdded: Object.keys(newTasks).length });
  } catch (error) {
    console.error('Error converting tips to tasks:', error);
    res.status(500).json({ error: 'Failed to convert tips to tasks' });
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