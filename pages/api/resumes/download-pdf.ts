import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { BlobServiceClient } from '@azure/storage-blob';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the authenticated user
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { resumeId } = req.query;
    
    if (!resumeId || typeof resumeId !== 'string') {
      return res.status(400).json({ error: 'Resume ID is required' });
    }

    // Connect to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING || ''
    );
    
    // Get the container client
    const containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME || 'resumes'
    );

    // Construct the blob path
    const blobPath = `user_${userId}/${resumeId}.pdf`;
    
    // Get the blob client
    const blobClient = containerClient.getBlobClient(blobPath);
    
    // Check if the blob exists
    const exists = await blobClient.exists();
    
    if (!exists) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Download the PDF
    const downloadResponse = await blobClient.download();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${resumeId}.pdf`);
    
    // Stream the PDF to the response
    if (downloadResponse.readableStreamBody) {
      downloadResponse.readableStreamBody.pipe(res);
    } else {
      return res.status(500).json({ error: 'Error downloading PDF' });
    }
  } catch (error) {
    console.error('Error downloading resume PDF:', error);
    return res.status(500).json({ error: 'Error downloading resume PDF' });
  }
}