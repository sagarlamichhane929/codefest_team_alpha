import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Room from '@/lib/models/Room';
import Question from '@/lib/models/Question';
import User from '@/lib/models/User';

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  await dbConnect();

  const room = await Room.findOne({ code: code.toUpperCase() });
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  const questionCount = await Question.countDocuments({ roomId: room._id });
  const host = await User.findById(room.hostId);

  return NextResponse.json({
    title: room.title,
    questionCount,
    host: host?.username || 'Unknown',
    settings: room.settings,
  });
}