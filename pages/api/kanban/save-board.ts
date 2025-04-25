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
    const { boardData } = req.body;
    
    // Connect to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING || ''
    );
    
    // Create container client (use userId for isolation)
    const containerName = 'kanban-data';
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    
    // Upload board data as a blob
    const blobName = `${userId}/board-data.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const data = JSON.stringify(boardData);
    await blockBlobClient.upload(data, data.length);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Azure Storage error:', error);
    res.status(500).json({ error: 'Failed to save board data' });
  }
}