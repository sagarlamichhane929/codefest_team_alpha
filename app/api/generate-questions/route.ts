import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  const { syllabus } = await request.json();

  if (!syllabus) {
    return NextResponse.json(
      { error: 'Syllabus is required' },
      { status: 400 }
    );
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Generate 5 multiple-choice questions based on the following syllabus: ${syllabus}

Each question should have:
- A question text
- 4 options (a, b, c, d)
- The correct answer (one of a, b, c, d)
- A brief explanation

Format the response as a JSON array of objects, each with:
{
  "questionText": "string",
  "options": [
    {"text": "string", "id": "a"},
    {"text": "string", "id": "b"},
    {"text": "string", "id": "c"},
    {"text": "string", "id": "d"}
  ],
  "correctAnswer": "a", // or b, c, d
  "explanation": "string"
}

Ensure the questions are relevant and educational.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON from the response
    const questions = JSON.parse(text);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
