import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Answer from '@/lib/models/Answer';
import Room from '@/lib/models/Room';
import Participant from '@/lib/models/Participant';
import Question from '@/lib/models/Question';

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

  const questionIds = await Question.find({ roomId: room._id }).distinct('_id');
  const answers = await Answer.find({ questionId: { $in: questionIds } });

  const scores: { [key: string]: { username: string; correct: number } } = {};

  for (const answer of answers) {
    const participant = await Participant.findById(answer.participantId);
    if (participant) {
      if (!scores[answer.participantId.toString()]) {
        scores[answer.participantId.toString()] = {
          username: participant.username,
          correct: 0,
        };
      }
      if (answer.isCorrect) {
        scores[answer.participantId.toString()].correct++;
      }
    }
  }

  const leaderboard = Object.values(scores).sort(
    (a, b) => b.correct - a.correct
  );

  return NextResponse.json({ leaderboard });
}
