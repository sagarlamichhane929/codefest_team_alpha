import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Room from '@/lib/models/Room';
import Participant from '@/lib/models/Participant';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  await dbConnect();

  const { code, username } = await request.json();
  const session = await getServerSession(authConfig);

  const room = await Room.findOne({ code: code.toUpperCase() });
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  const participantData: any = {
    roomId: room._id,
  };
  if (session) {
    participantData.userId = session.user.id;
    const user = await User.findById(session.user.id);
    participantData.username = user?.username || 'Anonymous';
  } else {
    if (!username) {
      return NextResponse.json(
        { error: 'Username required for guests' },
        { status: 400 }
      );
    }
    participantData.username = username;
  }

  // Check if already joined
  const existing = await Participant.findOne({
    roomId: room._id,
    $or: [
      { userId: participantData.userId },
      { username: participantData.username },
    ],
  });
  if (existing) {
    return NextResponse.json({ message: 'Already joined' });
  }

  const participant = new Participant(participantData);
  await participant.save();

  return NextResponse.json({ participantId: participant._id });
}
