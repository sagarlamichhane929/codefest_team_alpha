import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Answer from '@/lib/models/Answer';
import Question from '@/lib/models/Question';
import Participant from '@/lib/models/Participant';
import Room from '@/lib/models/Room';

export async function POST(request: NextRequest) {
  await dbConnect();

  const { code, questionId, selectedOption, participantId } =
    await request.json();

  const room = await Room.findOne({ code: code.toUpperCase() });
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  const participant = await Participant.findOne({
    _id: participantId,
    roomId: room._id,
  });
  if (!participant) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
  }

  const question = await Question.findById(questionId);
  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  const isCorrect = question.correctAnswer === selectedOption;

  const answer = new Answer({
    participantId: participant._id,
    questionId,
    selectedOption,
    isCorrect,
  });

  await answer.save();

  return NextResponse.json({ isCorrect });
}
