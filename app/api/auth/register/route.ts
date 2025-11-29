import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  await dbConnect();

  const { email, username, password } = await request.json();

  const trimmedUsername = username.trim();
  if (!email || !trimmedUsername || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { trimmedUsername }],
  });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    username: trimmedUsername,
    password: hashedPassword,
  });
  await user.save();

  return NextResponse.json({ message: 'User created' }, { status: 201 });
}
