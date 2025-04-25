import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { BlobServiceClient } from '@azure/storage-blob';

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
    const { taskId } = req.body;
    
    // Connect to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING || ''
    );
    
    // Get container client
    const containerName = 'kanban-data';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Check if container exists
    const containerExists = await containerClient.exists();
    if (!containerExists) {
      return res.status(404).json({ error: 'Board data not found' });
    }
    
    // Get blob client
    const blobName = `${userId}/board-data.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Check if blob exists
    const blobExists = await blockBlobClient.exists();
    if (!blobExists) {
      return res.status(404).json({ error: 'Board data not found' });
    }
    
    // Download current board data
    const downloadResponse = await blockBlobClient.download(0);
    const downloaded = await streamToString(downloadResponse.readableStreamBody);
    
    // Parse the JSON data
    const boardData = JSON.parse(downloaded);
    
    // Remove the task from the board data
    // This is just a record of the deletion, the actual state update happens client-side
    if (boardData.tasks && boardData.tasks[taskId]) {
      delete boardData.tasks[taskId];
      
      // Update all columns to remove the task ID
      for (const columnId in boardData.columns) {
        boardData.columns[columnId].taskIds = boardData.columns[columnId].taskIds.filter(
          (id: string) => id !== taskId
        );
      }
      
      // Upload updated board data
      const data = JSON.stringify(boardData);
      await blockBlobClient.upload(data, data.length);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Azure Storage error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
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