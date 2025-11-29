import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Room from '@/lib/models/Room';
import Question from '@/lib/models/Question';
import { generateRoomCode } from '@/lib/utils/generateCode';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authConfig);
  console.log('Session:', session);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const { title, timeLimit, maxParticipants, startTime, endTime, questions } =
    await request.json();
  console.log('Request data:', {
    title,
    timeLimit,
    maxParticipants,
    startTime,
    endTime,
    questions,
  });

  let code;
  do {
    code = generateRoomCode();
  } while (await Room.findOne({ code }));
  console.log('Generated code:', code);

  const room = new Room({
    code,
    hostId: session.user.id,
    title,
    settings: {
      timeLimit,
      maxParticipants,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
  });
  console.log('Saving room:', room);

  await room.save();
  console.log('Room saved:', room._id);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const question = new Question({
      roomId: room._id,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      order: i + 1,
    });
    console.log('Saving question:', question);
    await question.save();
  }

  return NextResponse.json({ roomId: room._id, code }, { status: 201 });
}
