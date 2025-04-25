import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { BlobServiceClient } from '@azure/storage-blob';
import { createClient } from 'redis';

// Desabilita o parsing do corpo, precisamos do corpo bruto para verificação da assinatura do Stripe
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Configuração do Azure Blob Storage
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);
const containerClient = blobServiceClient.getContainerClient('resume-data');

// Configuração do Redis no Azure
const redisClient = createClient({
  url: process.env.AZURE_REDIS_CONNECTION_STRING
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody.toString(), signature, webhookSecret);
    } catch (err: any) {
      console.error('Falha na verificação da assinatura do webhook:', err);
      return res.status(400).send(`Erro no Webhook: ${err.message}`);
    }

    // Manipula o evento checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Obtém informações do usuário dos metadados
      const { name, email, sessionId } = session.metadata || {};
      
      if (sessionId) {
        await redisClient.connect();
        
        // Obtém dados do currículo do Redis
        const redisKey = `cv_${sessionId}`;
        const resumeText = await redisClient.get(redisKey);
        
        if (resumeText) {
          // Armazena no Azure Blob Storage
          const blobName = `${session.id}-${Date.now()}.json`;
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          
          const userData = {
            name: name || '',
            email: email || session.customer_email || '',
            resumeText,
            paymentId: session.id,
            timestamp: new Date().toISOString()
          };
          
          await blockBlobClient.upload(JSON.stringify(userData), JSON.stringify(userData).length);
          
          // Podemos manter os dados no Redis durante a sessão
          // ou opcionalmente excluí-los já que os armazenamos permanentemente
          // await redisClient.del(redisKey);
        }
        
        await redisClient.disconnect();
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
}