import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Answer from '@/lib/models/Answer';
import Question from '@/lib/models/Question';
import Room from '@/lib/models/Room';
import Participant from '@/lib/models/Participant';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  await dbConnect();

  const room = await Room.findOne({ code: code.toUpperCase() });
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  const participants = await Participant.find({ roomId: room._id });
  const questions = await Question.find({ roomId: room._id }).sort({
    order: 1,
  });

  const results: {
    username: string;
    participantId: string;
    score: number;
    totalAttempts: number;
    answers: {
      question: string;
      selected: string;
      correct: boolean;
      correctAnswer: string;
      explanation: string;
    }[];
  }[] = [];

  for (const participant of participants) {
    const answers = await Answer.find({ participantId: participant._id });
    const score = answers.filter((a) => a.isCorrect).length;
    const detailedAnswers = answers.map((a) => {
      const q = questions.find(
        (q) => q._id.toString() === a.questionId.toString()
      );
      const correctOption = q?.options.find((o) => o.id === q.correctAnswer);
      return {
        question: q?.questionText || '',
        options: q?.options || [],
        selected: a.selectedOption,
        correct: a.isCorrect,
        correctAnswer: correctOption?.text || '',
        explanation: q?.explanation || '',
      };
    });
    results.push({
      username: participant.username,
      participantId: participant._id.toString(),
      score,
      totalAttempts: answers.length,
      answers: detailedAnswers,
    });
  }

  results.sort((a, b) => b.score - a.score);

  const questionStats = await Promise.all(
    questions.map(async (q) => {
      const answersForQ = await Answer.find({ questionId: q._id });
      const correct = answersForQ.filter((a) => a.isCorrect).length;
      return { question: q.questionText, correct, total: answersForQ.length };
    })
  );

  return NextResponse.json({ results, questionStats });
}
