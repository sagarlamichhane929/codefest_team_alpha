'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const joinSchema = z.object({
  code: z.string().min(6, 'Code must be 6 characters').max(6),
  username: z.string().optional(),
});

type JoinForm = z.infer<typeof joinSchema>;

export default function JoinRoom() {
  const [room, setRoom] = useState<{
    title: string;
    questionCount: number;
    host: string;
  } | null>(null);
  const [step, setStep] = useState(1);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
  });
  const router = useRouter();
  const { data: session } = useSession();

  const onSubmit = async (data: JoinForm) => {
    if (step === 1) {
      // fetch room details
      const response = await fetch(`/api/rooms/${data.code}`);
      if (response.ok) {
        const roomData = await response.json();
        setRoom(roomData);
        setStep(2);
      } else {
        alert('Room not found');
      }
    } else {
      // join room
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: data.code, username: data.username }),
      });
      if (response.ok) {
        const joinData = await response.json();
        localStorage.setItem('participantId', joinData.participantId);
        router.push(`/room/${data.code}`);
      } else {
        alert('Error joining room');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Join Quiz Room</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="code">Room Code</label>
                  <Input
                    id="code"
                    {...register('code')}
                    placeholder="Enter 6-character code"
                  />
                  {errors.code && (
                    <p className="text-red-500">{errors.code.message}</p>
                  )}
                </div>
                <Button type="submit">Find Room</Button>
              </div>
            )}
            {step === 2 && room && (
              <div className="space-y-4">
                <h2>Room Details</h2>
                <p>Title: {room.title}</p>
                <p>Questions: {room.questionCount}</p>
                <p>Host: {room.host}</p>
                {!session && (
                  <div>
                    <label htmlFor="username">Your Name (for guests)</label>
                    <Input
                      id="username"
                      {...register('username')}
                      placeholder="Enter your name"
                    />
                  </div>
                )}
                {session && <p>You are joining as: {session.user?.name}</p>}
                <div className="flex gap-2">
                  <Button type="button" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit">Join Room</Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
