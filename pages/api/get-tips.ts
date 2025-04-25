import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from 'redis';
import { AzureOpenAI } from 'openai';
import { mockTips } from '../../utils/mockData';

const redisClient = createClient({
  url: process.env.AZURE_REDIS_CONNECTION_STRING
});

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

  try {
    // Try to connect to Redis and get the resume text
    let resumeText = null;
    try {
      await redisClient.connect();
      resumeText = await redisClient.get(`cv_${sessionId}`);
      await redisClient.disconnect();
    } catch (redisError) {
      console.error('Redis connection error:', redisError);
      // Continue with mock data if Redis fails
    }

    // If resume not found in Redis, use mock data
    if (!resumeText) {
      console.log('Resume not found or Redis error, using mock data');
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
        console.log('Invalid JSON from OpenAI:', tipsContent);
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