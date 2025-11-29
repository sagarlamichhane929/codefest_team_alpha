import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
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

  return NextResponse.json({
    room: {
      title: room.title,
      status: room.status,
      hostId: room.hostId,
      participants,
      settings: room.settings,
    },
  });
}
