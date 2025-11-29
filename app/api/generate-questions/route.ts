// app/api/generate-questions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  const { syllabus } = await request.json();

  if (!syllabus) {
    return NextResponse.json({ error: 'Syllabus is required' }, { status: 400 });
  }

  try {
    // Use a current, free model (gemini-pro is gone)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Generate exactly 5 multiple-choice questions from this syllabus: ${syllabus}

Rules:
- Output ONLY a valid JSON array (no markdown, no extra text)
- Exactly 5 objects
- Each object must match this exact shape:

{
  "questionText": "string",
  "options": [
    {"text": "string", "id": "a"},
    {"text": "string", "id": "b"},
    {"text": "string", "id": "c"},
    {"text": "string", "id": "d"}
  ],
  "correctAnswer": "a" | "b" | "c" | "d",
  "explanation": "string"
}

Syllabus:
${syllabus}`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    // ← THIS IS THE FIX
    const text = response.text();   // <-- call the function!
    console.log('Raw AI response:', text);

    // Clean possible code fences
    let jsonString = text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.slice(7).replace(/```$/, '').trim();
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.slice(3).replace(/```$/, '').trim();
    }

    let questions;
    try {
      questions = JSON.parse(jsonString);
    } catch (e) {
      console.error('JSON parse failed:', e);
      return NextResponse.json(
        { error: 'AI returned invalid JSON' },
        { status: 500 }
      );
    }

    // Basic validation
    if (!Array.isArray(questions) || questions.length !== 5) {
      return NextResponse.json(
        { error: 'Expected exactly 5 questions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions', details: error.message },
      { status: 500 }
    );
  }
}
