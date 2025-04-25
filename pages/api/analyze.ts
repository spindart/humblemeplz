import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import PDFParser from 'pdf2json';
import { AzureOpenAI } from 'openai';
import { getAuth } from '@clerk/nextjs/server';
import { kv } from '@vercel/kv';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};



const client = new AzureOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  endpoint: process.env.OPENAI_ENDPOINT,
  apiVersion: process.env.OPENAI_API_VERSION || "2023-05-15" // Use a versão mais recente do API ou deixe como undefined para usar a versão padrão do Azure OpenAI
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

// Configuração do Redis no Azure with retry logic and error handling
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let redisClient = null;
  let sessionId = uuidv4(); // Gera o ID de sessão no início para garantir consistência

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

    // Create a new Redis client for each request
    redisClient = getRedisClient();
    let parsedResponse = null;

    try {
      // Conecta ao Redis
      await redisClient.connect();

      // Armazena o texto do currículo
      await redisClient.set(`cv_${sessionId}`, pdfText);
      await redisClient.expire(`cv_${sessionId}`, 86400); // 24 hours

      // Tenta obter resposta da OpenAI
      try {
        const completion = await client.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are a brutally honest and darkly humorous critic of résumés and LinkedIn profiles. Your task is to thoroughly roast the provided document with sarcasm and wit while secretly providing valuable feedback. Focus intensely on analyzing specific details rather than making generic comments. Use emojis ONLY to emphasize humorous observations, critical feedback, or ironic points. Place emojis strategically to highlight moments where you're being particularly witty or delivering important critique, they should appear only at key moments for emphasis or humor.

Perform an in-depth analysis of these critical areas:

1. PROFESSIONAL EXPERIENCE (HIGH PRIORITY):
   - Scrutinize each company listed: Are they impressive? Relevant? Suspicious gaps?
   - Evaluate job titles: Are they inflated or undersold?
   - Analyze responsibilities vs. achievements: Does the candidate actually show results or just list duties?
   - Look for metrics and quantifiable achievements (or the lack thereof)
   - Comment on career progression (or stagnation)
   - Identify red flags like job-hopping or suspicious employment gaps

2. SKILLS ASSESSMENT (HIGH PRIORITY):
   - Critically evaluate technical and soft skills claimed
   - Compare skill claims against evidence in work experience
   - Identify outdated, irrelevant, or obviously exaggerated skills
   - Note any generic skills everyone claims ("communication", "teamwork")
   - Assess depth vs. breadth of expertise
   - Identify missing critical skills for their target role/industry

3. EDUCATION DEEP DIVE (HIGH PRIORITY):
   - Assess relevance of degrees to career path
   - Comment on institution prestige or obscurity
   - Note any missing expected certifications or continued education
   - Evaluate how education is leveraged in their career narrative
   - Identify educational red flags or misalignments with career goals

4. ADDITIONAL ASSESSMENT AREAS:
   - Document formatting and visual appeal (or lack thereof)
   - Overall career narrative and coherence
   - Personal branding elements
   - Language, tone, and professionalism

Your response should be 300-400 words maximum, structured as:
- A sarcastic introduction (2-3 sentences)
- A detailed roast of their PROFESSIONAL EXPERIENCE (specific companies, roles, descriptions)
- A brutal critique of their claimed SKILLS (specific skills mentioned)
- A merciless analysis of their EDUCATION (specific degrees/institutions)
- "EPIC FAILURES": 4-6 specific, detailed examples of the worst elements
- "SAVAGE ADVICE": 2-3 specific improvement suggestions disguised as insults

IMPORTANT: Respond ONLY with a valid JSON object WITHOUT markdown formatting or code blocks. The object must contain:
- "analysis": Your complete and detailed analysis, including all sections mentioned above.
- "score": Humiliation level from 0 (mild) to 100 (total destruction).
- "aiScore": Actual quality rating of the document, from 1 (complete disaster) to 10 (perfection).

Example of correct response format:
{"analysis":"Your detailed analysis here...","score":75,"aiScore":4}

DO NOT RETURN ANYTHING OTHER THAN THE PURE JSON OBJECT.`
            },
            {
              role: "user",
              content: `Here's the document text to analyze:\n${pdfText}`
            }
          ],
          model: 'gpt-4o-mini', // Use a variável modelName em vez de 'gpt-4o-mini'
          temperature: 0.8,
          max_tokens: 1500,
          response_format: { type: "json_object" }
        });

        const responseContent = completion.choices[0]?.message?.content;
        //console.log(responseContent)
        if (!responseContent) {
          throw new Error('No response content from OpenAI');
        }

        // After parsing the response from OpenAI
        parsedResponse = JSON.parse(responseContent);

        // Ensure score and aiScore are numbers
        parsedResponse.score = typeof parsedResponse.score === 'number' ?
          Math.min(100, Math.max(0, parsedResponse.score)) : 75;
        parsedResponse.aiScore = typeof parsedResponse.aiScore === 'number' ?
          Math.min(10, Math.max(1, parsedResponse.aiScore)) : 5;

        // Format the analysis text to ensure proper HTML rendering and Markdown formatting
        parsedResponse.analysis = parsedResponse.analysis
          .replace(/\n\n/g, '{{PARAGRAPH}}')
          .replace(/\n/g, '<br>')
          .replace(/{{PARAGRAPH}}/g, '<br><br>')
          // Primeiro substituir os títulos de seção com asteriscos e dois pontos
          .replace(/\*+\s*PROFESSIONAL EXPERIENCE\s*\*+\s*:*/g, '<h3 class="text-lg font-bold mt-4 mb-2">PROFESSIONAL EXPERIENCE</h3>')
          .replace(/\*+\s*SKILLS ASSESSMENT\s*\*+\s*:*/g, '<h3 class="text-lg font-bold mt-4 mb-2">SKILLS ASSESSMENT</h3>')
          .replace(/\*+\s*EDUCATION DEEP DIVE\s*\*+\s*:*/g, '<h3 class="text-lg font-bold mt-4 mb-2">EDUCATION DEEP DIVE</h3>')
          .replace(/\*+\s*EPIC FAILURES\s*\*+\s*:*/g, '<h3 class="text-lg font-bold mt-4 mb-2">EPIC FAILURES</h3>')
          .replace(/\*+\s*SAVAGE ADVICE\s*\*+\s*:*/g, '<h3 class="text-lg font-bold mt-4 mb-2">SAVAGE ADVICE</h3>')
          // Substituir títulos sem asteriscos mas com dois pontos
          .replace(/PROFESSIONAL EXPERIENCE\s*:+/g, '<h3 class="text-lg font-bold mt-4 mb-2">PROFESSIONAL EXPERIENCE</h3>')
          .replace(/SKILLS ASSESSMENT\s*:+/g, '<h3 class="text-lg font-bold mt-4 mb-2">SKILLS ASSESSMENT</h3>')
          .replace(/EDUCATION DEEP DIVE\s*:+/g, '<h3 class="text-lg font-bold mt-4 mb-2">EDUCATION DEEP DIVE</h3>')
          .replace(/EPIC FAILURES\s*:+/g, '<h3 class="text-lg font-bold mt-4 mb-2">EPIC FAILURES</h3>')
          .replace(/SAVAGE ADVICE\s*:+/g, '<h3 class="text-lg font-bold mt-4 mb-2">SAVAGE ADVICE</h3>')
          // Depois remover todos os asteriscos restantes
          .replace(/\*/g, '')
          // Manter as substituições originais como fallback
          .replace(/PROFESSIONAL EXPERIENCE/g, '<h3 class="text-lg font-bold mt-4 mb-2">PROFESSIONAL EXPERIENCE</h3>')
          .replace(/SKILLS ASSESSMENT/g, '<h3 class="text-lg font-bold mt-4 mb-2">SKILLS ASSESSMENT</h3>')
          .replace(/EDUCATION DEEP DIVE/g, '<h3 class="text-lg font-bold mt-4 mb-2">EDUCATION DEEP DIVE</h3>')
          .replace(/EPIC FAILURES/g, '<h3 class="text-lg font-bold mt-4 mb-2">EPIC FAILURES</h3>')
          .replace(/SAVAGE ADVICE/g, '<h3 class="text-lg font-bold mt-4 mb-2">SAVAGE ADVICE</h3>');

      } catch (openaiError) {
        console.warn('Azure OpenAI API failed, using mock response:', openaiError);

        // Usa resposta mockada se a OpenAI falhar
        const mockResponse = getMockResponse();
        //console.log('Using mock response (details):', JSON.stringify(mockResponse));

        parsedResponse = {
          analysis: mockResponse.analysis,
          score: Math.min(100, Math.max(0, mockResponse.score)),
          aiScore: Math.min(10, Math.max(1, mockResponse.aiScore))
        };

        //console.log('Final parsed response:', JSON.stringify(parsedResponse));
      }

      // Armazena a crítica no Redis (seja da OpenAI ou mockada)
      if (parsedResponse) {
        try {
          await redisClient.set(`critique_${sessionId}`, JSON.stringify(parsedResponse));
          await redisClient.expire(`critique_${sessionId}`, 86400); // 24 hours
        } catch (redisError) {
          console.error('Redis storage error:', redisError);
          // Continue mesmo se o Redis falhar
        }
      }

    } catch (error) {
      console.error('Error with Redis or other processing:', error);

      // Se houver erro no Redis ou outro processamento, ainda usa mock
      if (!parsedResponse) {
        const mockResponse = getMockResponse();
        parsedResponse = {
          analysis: mockResponse.analysis,
          score: Math.min(100, Math.max(0, mockResponse.score)),
          aiScore: Math.min(10, Math.max(1, mockResponse.aiScore))
        };
      }
    } finally {
      // Limpa o arquivo temporário
      try {
        await fs.unlink(filePath);
      } catch (fileError) {
        console.error('Error deleting temporary file:', fileError);
      }

      // Desconecta o Redis se estiver conectado
      if (redisClient && redisClient.isOpen) {
        try {
          await redisClient.disconnect();
        } catch (disconnectError) {
          console.error('Error disconnecting Redis:', disconnectError);
        }
      }
    }

    // Retorna a resposta com o sessionId
    if (parsedResponse) {
      return res.status(200).json({
        ...parsedResponse,
        sessionId
      });
    } else {
      // Fallback final se tudo falhar
      return res.status(200).json({
        analysis: "Failed to process your resume, but I'm sure it was mediocre anyway! 😅\n\nPRO TIP: Next time, try submitting a resume that doesn't look like it was written by a chatbot having an existential crisis! 🤖",
        score: 100,
        aiScore: 1,
        sessionId
      });
    }

  } catch (error) {
    console.error('Error processing PDF:', error);

    // Desconecta o Redis se estiver conectado
    if (redisClient && redisClient.isOpen) {
      try {
        await redisClient.disconnect();
      } catch (disconnectError) {
        console.error('Error disconnecting Redis:', disconnectError);
      }
    }

    // Retorna um mock básico se tudo falhar
    return res.status(200).json({
      analysis: "Falha ao processar seu currículo, mas tenho certeza de que era medíocre de qualquer maneira! 😅\n\nDICA PRO: Na próxima vez, tente enviar um currículo que não pareça ter sido escrito por um chatbot tendo uma crise existencial! 🤖",
      score: 100,
      aiScore: 1,
      sessionId
    });
  }
}