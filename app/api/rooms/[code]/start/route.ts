import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Room from '@/lib/models/Room';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const room = await Room.findOne({ code: code.toUpperCase() });
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  console.log('Room hostId:', room.hostId, 'Session user id:', session.user.id);
  if (!room.hostId) {
    room.hostId = session.user.id;
    await room.save();
  } else if (room.hostId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Only host can start' }, { status: 403 });
  }

  room.status = 'active';
  await room.save();

  return NextResponse.json({ message: 'Quiz started' });
}
