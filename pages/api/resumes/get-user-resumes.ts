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

    // Connect to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING || ''
    );
    
    // Get the container client
    const containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME || 'resume-data'
    );

    // List all blobs with the user's ID prefix
    const userPrefix = `user_${userId}/`;
    const blobItems = [];
    
    // Use pagination to handle many resume entries
    const iterator = containerClient.listBlobsFlat({
      prefix: userPrefix
    }).byPage({ maxPageSize: 50 });
    
    let response = await iterator.next();
    
    while (!response.done) {
      for (const blob of response.value.segment.blobItems) {
        // Only process PDF files and their associated JSON analysis
        if (blob.name.endsWith('.pdf')) {
          const pdfBlobName = blob.name;
          const jsonBlobName = pdfBlobName.replace('.pdf', '.json');
          
          // Get the PDF blob properties
          const pdfBlobClient = containerClient.getBlobClient(pdfBlobName);
          const pdfProperties = await pdfBlobClient.getProperties();
          
          // Try to get the associated JSON analysis
          try {
            const jsonBlobClient = containerClient.getBlobClient(jsonBlobName);
            const jsonExists = await jsonBlobClient.exists();
            
            if (jsonExists) {
              // Download the JSON content
              const downloadResponse = await jsonBlobClient.download();
              const jsonContent = await streamToString(downloadResponse.readableStreamBody);
              const analysis = JSON.parse(jsonContent);
              
              // Extract filename from the blob path
              const fileName = pdfBlobName.split('/').pop() || 'Unnamed Resume';
              
              // Generate a thumbnail URL (if you have a thumbnail generation service)
              const thumbnailUrl = pdfBlobClient.url + '?thumbnail=true';
              
              blobItems.push({
                id: pdfBlobName.replace(userPrefix, '').replace('.pdf', ''),
                fileName,
                uploadDate: pdfProperties.lastModified?.toISOString() || new Date().toISOString(),
                score: analysis.score || 0,
                aiScore: analysis.aiScore || 0,
                analysis: analysis.analysis || '',
                thumbnailUrl: thumbnailUrl,
                pdfUrl: pdfBlobClient.url
              });
            }
          } catch (error) {
            console.error('Error processing JSON analysis:', error);
            // Still include the PDF even if we can't get the analysis
            const fileName = pdfBlobName.split('/').pop() || 'Unnamed Resume';
            
            blobItems.push({
              id: pdfBlobName.replace(userPrefix, '').replace('.pdf', ''),
              fileName,
              uploadDate: pdfProperties.lastModified?.toISOString() || new Date().toISOString(),
              score: 0,
              aiScore: 0,
              analysis: 'Analysis not available',
              pdfUrl: pdfBlobClient.url
            });
          }
        }
      }
      
      response = await iterator.next();
    }

    return res.status(200).json({ resumes: blobItems });
  } catch (error) {
    console.error('Error retrieving user resumes:', error);
    return res.status(500).json({ error: 'Error retrieving user resumes' });
  }
}

// Helper function to convert a readable stream to a string
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