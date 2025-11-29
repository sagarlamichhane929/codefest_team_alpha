import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Question from '@/lib/models/Question';
import Room from '@/lib/models/Room';

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  await dbConnect();

  const room = await Room.findOne({ code: code.toUpperCase() });
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  const questions = await Question.find({ roomId: room._id }).sort({ order: 1 });

  return NextResponse.json({ questions });
}