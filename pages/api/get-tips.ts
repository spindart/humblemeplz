import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { kv } from '@vercel/kv';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mock responses as fallback
const mockResponses = [
  {
    category: "Content Improvements",
    tips: [
      "Use action verbs to start your bullet points (e.g., 'Developed', 'Implemented', 'Led')",
      "Quantify achievements with specific numbers and percentages",
      "Remove outdated or irrelevant experience",
      "Focus on achievements rather than job duties",
      "Customize your resume for each job application"
    ]
  },
  {
    category: "Format & Structure",
    tips: [
      "Keep your resume to 1-2 pages maximum",
      "Use consistent formatting throughout",
      "Ensure adequate white space for readability",
      "Choose a professional, readable font (e.g., Arial, Calibri)",
      "Use bullet points instead of paragraphs for experience"
    ]
  },
  {
    category: "Skills Enhancement",
    tips: [
      "Include both hard and soft skills",
      "Remove outdated or basic skills (e.g., Microsoft Word)",
      "Add relevant technical skills and certifications",
      "Match skills to the job requirements",
      "Include proficiency levels for language and technical skills"
    ]
  },
  {
    category: "Career Development Plan",
    tips: [
      "Identify key skills gaps in your current profile",
      "Research industry certifications that could boost your value",
      "Join professional associations in your field",
      "Build a portfolio of projects to showcase skills",
      "Network with professionals in your target role"
    ]
  }
];

async function generateAITips(cvContent: string): Promise<any> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional career consultant and resume expert. Analyze the provided CV and create a personalized improvement plan with 4 categories:
          1. Content Improvements - Specific ways to improve the current content
          2. Format & Structure - How to better organize and present the information
          3. Skills Enhancement - What skills to develop based on their current profile
          4. Career Development Plan - A roadmap for professional growth
          
          For each category, provide 5 specific, actionable tips based on the CV content.
          The tips should be personalized to the individual's experience level, industry, and current skills.
          
          Return the response in this exact JSON format:
          {
            "tips": [
              {
                "category": "Category Name",
                "tips": ["tip1", "tip2", "tip3", "tip4", "tip5"]
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Please analyze this CV and provide personalized improvement tips and a career development roadmap:\n\n${cvContent}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating AI tips:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    let tips;
    let source = 'ai';

    try {
      // Get the CV content from the session
      const sessionKey = `cv_${session_id}`;
      const cvContent = await kv.get(sessionKey);

      if (!cvContent) {
        throw new Error('CV content not found in session');
      }

      // Generate personalized tips based on the CV
      const aiResponse = await generateAITips(cvContent as string);
      tips = aiResponse.tips;
    } catch (aiError) {
      // If AI fails or CV not found, fall back to mock responses
      console.warn('Falling back to mock responses:', aiError);
      tips = mockResponses;
      source = 'mock';
    }

    // Add a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    return res.status(200).json({ tips, source });
  } catch (error) {
    console.error('Error getting tips:', error);
    return res.status(500).json({ error: 'Error retrieving tips' });
  }
} 