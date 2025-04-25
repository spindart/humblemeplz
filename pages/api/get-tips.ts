import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from 'redis';
import { AzureOpenAI } from 'openai';
import { mockTips } from '../../utils/mockData';

// Use the same Redis client configuration as in analyze.ts
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

const client = new AzureOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  endpoint: process.env.OPENAI_ENDPOINT,
  apiVersion: process.env.OPENAI_API_VERSION || "2023-05-15"
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.query;

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  let redisClient = null;

  try {
    // Create a new Redis client for this request
    redisClient = getRedisClient();
    
    // Try to connect to Redis and get the resume text
    let resumeText = null;
    try {
      await redisClient.connect();
      
      // Check if this is a Stripe session ID
      let redisKey = `cv_${sessionId}`;
      
      // If it's a Stripe session ID (starts with cs_), try to get the original session ID
      if (sessionId.startsWith('cs_')) {
        //console.log(`Detected Stripe session ID: ${sessionId}`);
        
        // First try to get the resume directly with the Stripe session ID
        resumeText = await redisClient.get(redisKey);
        
        // If not found, try to get the mapping from Stripe session ID to original session ID
        if (!resumeText) {
         // console.log('Resume not found with Stripe session ID, checking for mapping');
          const originalSessionId = await redisClient.get(`stripe_to_session_${sessionId}`);
          
          if (originalSessionId) {
           // console.log(`Found mapping to original session ID: ${originalSessionId}`);
            redisKey = `cv_${originalSessionId}`;
            resumeText = await redisClient.get(redisKey);
          } else {
            // If no mapping exists, try to use the most recent resume as a fallback
          //  console.log('No mapping found, checking all keys');
            const keys = await redisClient.keys('cv_*');
           // console.log(`Found ${keys.length} resume keys in Redis`);
            
            if (keys.length === 1) {
              // If there's only one resume, use that
              redisKey = keys[0];
              //console.log(`Using the only available resume key: ${redisKey}`);
              resumeText = await redisClient.get(redisKey);
            } else if (keys.length > 1) {
              // If there are multiple resumes, try to find the most recent one
              // This is a temporary solution - ideally, you should store timestamps with your resumes
             // console.log('Multiple resumes found, using the first one as a fallback');
              redisKey = keys[0];
              resumeText = await redisClient.get(redisKey);
              
              // Store a mapping for future use
              await redisClient.set(`stripe_to_session_${sessionId}`, redisKey.replace('cv_', ''));
              await redisClient.expire(`stripe_to_session_${sessionId}`, 86400); // 24 hours
            }
          }
        }
      } else {
        // Use the provided session ID
        resumeText = await redisClient.get(redisKey);
      }
      
      //console.log(`Resume found for key ${redisKey}: ${!!resumeText}`);
    } catch (redisError) {
     // console.error('Redis connection error:', redisError);
      // Continue with mock data if Redis fails
    } finally {
      // Always disconnect when done
      if (redisClient && redisClient.isOpen) {
        try {
          await redisClient.disconnect();
        } catch (disconnectError) {
          //console.error('Error disconnecting Redis:', disconnectError);
        }
      }
    }

    // If resume not found in Redis, use mock data
    if (!resumeText) {
      //console.log('Resume not found or Redis error, using mock data');
      const formattedTips = mockTips.map(category => ({
        category: category.category,
        tips: category.tips
      }));
      return res.status(200).json({ tips: formattedTips, source: 'mock' });
    }

    const prompt = `You are an insightful and experienced career advisor who provides valuable professional development guidance. Your task is to analyze the provided résumé and create a personalized career improvement roadmap.

Based on the résumé, create a detailed career development plan that is honest, practical, and occasionally witty, but always focused on providing genuine value to help this person advance professionally.

Analyze the résumé carefully to identify:
1. Real strengths demonstrated through concrete achievements and experience
2. Logical next career steps based on their background and industry trends
3. Specific skill gaps that would enhance their marketability
4. Relevant courses or certifications with actual names and providers
5. Personal branding strategies tailored to their specific field
6. Networking approaches appropriate for their industry and career stage
7. One candid but constructive tip that addresses a notable weakness

Your response should be specific to this individual's résumé details - reference actual companies, skills, roles or experiences mentioned in their document.

IMPORTANT: Output ONLY a valid JSON object with the following structure (each array should contain 3-5 detailed string items):
{
  "current_strengths": [array of strings highlighting verified strengths],
  "career_goals_suggestion": [array of strings with potential career paths],
  "skills_to_learn": [array of strings listing specific skills to develop],
  "courses_or_certifications": [array of strings with specific course/certification recommendations],
  "personal_branding_tips": [array of strings with branding advice],
  "networking_strategies": [array of strings with networking suggestions],
  "random_brutally_honest_tip": "One straightforward piece of advice addressing a notable weakness"
}

Respond ONLY with the JSON object.`;

    try {
      // Call OpenAI API
      const completion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: resumeText }
        ],
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 2000
      });

      const tipsContent = completion.choices[0].message?.content || '';
      
      try {
        // Parse the JSON response
        const parsedTips = JSON.parse(tipsContent);
        
        // Transform the JSON into the expected format for the frontend
        const formattedTips = [
          { 
            category: "Current Strengths", 
            tips: parsedTips.current_strengths || [] 
          },
          { 
            category: "Career Path Suggestions", 
            tips: parsedTips.career_goals_suggestion || [] 
          },
          { 
            category: "Skills to Develop", 
            tips: parsedTips.skills_to_learn || [] 
          },
          { 
            category: "Recommended Courses & Certifications", 
            tips: parsedTips.courses_or_certifications || [] 
          },
          { 
            category: "Personal Branding Strategy", 
            tips: parsedTips.personal_branding_tips || [] 
          },
          { 
            category: "Networking Approaches", 
            tips: parsedTips.networking_strategies || [] 
          }
        ];
        
        // Add the brutally honest tip as its own category
        if (parsedTips.random_brutally_honest_tip) {
          formattedTips.push({
            category: "Brutally Honest Advice",
            tips: [parsedTips.random_brutally_honest_tip]
          });
        }
        
        return res.status(200).json({ tips: formattedTips, source: 'ai' });
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        //console.log('Invalid JSON from OpenAI:', tipsContent);
        // Fall back to mock data if parsing fails
        return res.status(200).json({ tips: mockTips, source: 'mock' });
      }
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      // Fall back to mock data if OpenAI fails
      return res.status(200).json({ tips: mockTips, source: 'mock' });
    }
  } catch (error) {
    console.error('Error generating tips:', error);
    return res.status(500).json({ error: 'Error generating personalized tips' });
  }
}