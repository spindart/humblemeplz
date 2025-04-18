import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import PDFParser from 'pdf2json';
import { OpenAI } from 'openai';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mockResponses = [
  {
    analysis: `Oh boy, another "detail-oriented" professional who can't even align their margins properly! Your six glorious years of experience read like a collection of "I showed up to work" achievements. And that objective statement? "Looking to leverage my skills in a dynamic environment" - how about "desperately hoping someone will pay me to do the bare minimum"? 😂

HIGHLIGHTS:
• Your "proficient in Microsoft Office" claim is as impressive as saying you can operate a light switch
• Those Udemy certificates might as well be "I watched YouTube tutorials" badges
• Your "team player" description contradicts your "works well independently" claim - pick a lane!

Pro tip: Maybe try adding some actual accomplishments instead of listing "attended meetings" as a key responsibility. Just a thought! 🤷‍♂️`,
    score: 85,
    aiScore: 3
  },
  {
    analysis: `Ah, another masterpiece of mediocrity! Your resume reads like a LinkedIn profile having an identity crisis. Let's start with those "leadership skills" you claim to have - organizing the office birthday party doesn't make you Winston Churchill! 

OBSERVATIONS:
• Your "extensive experience" section could be summarized as "I've had jobs"
• That skill bar chart is adorable - 5/5 stars in everything? Even Superman has weaknesses!
• Your "proficient in multiple programming languages" means you once wrote "Hello World" in three different IDEs

Maybe consider adding some actual metrics instead of buzzwords? Just saying "increased efficiency" without numbers is like saying "I'm tall" while sitting down! 😅`,
    score: 92,
    aiScore: 2
  },
  {
    analysis: `*Adjusts glasses* Ah yes, another "results-driven professional" who forgot to include any actual results! Your resume is like a movie trailer that shows all the boring parts. 

QUICK HITS:
• Your job titles are more inflated than cryptocurrency prices
• "Expert in industry best practices" = "I read a blog post once"
• That font choice is more offensive than pineapple on pizza

Remember: "Responsible for" is code for "I was in the room while things happened." Try showing what you actually DID! 🚀`,
    score: 95,
    aiScore: 1
  }
];

const parsePDF = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      if (!pdfData?.Pages) {
        reject(new Error('Invalid PDF data structure'));
        return;
      }
      const text = pdfData.Pages.map((page: any) => 
        page.Texts?.map((text: any) => 
          text.R?.map((r: any) => r.T || '').join(' ') || ''
        ).join(' ') || ''
      ).join(' ');
      resolve(text || '');
    });

    pdfParser.on('pdfParser_dataError', (errMsg: { parserError: Error }) => {
      reject(errMsg.parserError);
    });

    pdfParser.loadPDF(filePath);
  });
};

const getMockResponse = () => {
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    
    if (!files.file || !Array.isArray(files.file) || !files.file[0]) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = files.file[0];
    const filePath = uploadedFile.filepath;

    const pdfText = await parsePDF(filePath);
    if (!pdfText.trim()) {
      return res.status(400).json({ error: 'Failed to extract text from PDF or PDF is empty' });
    }

    // Try OpenAI first
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a humorous and cruel resume critic. Analyze the resume and provide feedback in a funny and humiliating way. Keep responses concise. Include two scores: humiliation level (0-100) and resume rating (1-10). Format your response as JSON with fields: analysis (string), score (number - humiliation level), aiScore (number - resume rating)."
          },
          {
            role: "user",
            content: `Here's the resume text to analyze:\n${pdfText}`
          }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.8,
        max_tokens: 500
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response content from OpenAI');
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseContent);
      } catch (error) {
        throw new Error('Failed to parse OpenAI response');
      }

      // Clean up the temporary file
      await fs.unlink(filePath);
      return res.status(200).json(parsedResponse);

    } catch (openaiError) {
      console.warn('OpenAI API failed, using mock response:', openaiError);
      
      // Get a mock response
      const mockResponse = getMockResponse();
      console.log('Using mock response:', mockResponse); // Debug log
      
      // Clean up the temporary file
      await fs.unlink(filePath);
      
      // Return the mock response
      return res.status(200).json({
        analysis: mockResponse.analysis,
        score: mockResponse.score,
        aiScore: mockResponse.aiScore
      });
    }
  } catch (error) {
    console.error('Error processing PDF:', error);
    // If everything fails, return a basic mock
    return res.status(200).json({
      analysis: "Failed to process your resume, but I'm sure it was mediocre anyway! 😅\n\nPRO TIP: Next time, try submitting a resume that doesn't look like it was written by a chatbot having an existential crisis! 🤖",
      score: 100,
      aiScore: 1
    });
  }
} 