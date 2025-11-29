'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Participant {
  _id: string;
  username: string;
}

interface Room {
  title: string;
  status: string;
  hostId: string;
  participants: Participant[];
  settings: {
    startTime: string;
  };
}

export default function RoomPage() {
  const params = useParams();
  const code = params.code as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const { data: session } = useSession();

  const fetchRoom = async () => {
    const response = await fetch(`/api/rooms/${code}/details`);
    if (response.ok) {
      const data = await response.json();
      setRoom(data.room);

      if (data.room.settings.startTime) {
        const startTime = new Date(data.room.settings.startTime).getTime();
        setTimeLeft(Math.max(0, startTime - Date.now()));
      }
    }
  };

  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
  }, [code]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1000), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (room?.status === 'active') {
      window.location.href = `/quiz/${code}`;
    }
  }, [room?.status]);

  const startQuiz = async () => {
    const response = await fetch(`/api/rooms/${code}/start`, {
      method: 'POST',
    });
    if (response.ok) {
      setRoom((prev) => (prev ? { ...prev, status: 'active' } : null));
    }
  };

  if (!room) return <div>Loading...</div>;

  const isHost = room.hostId === session?.user?.id;
  const isCountdownRunning = timeLeft !== null && timeLeft > 0;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {room.title} - {room.status}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <h3>Participants:</h3>
          <ul>
            {room.participants.map((p) => (
              <li key={p._id}>{p.username}</li>
            ))}
          </ul>

          {isCountdownRunning && (
            <div>
              <h4>Quiz starts in:</h4>
              <p>
                {Math.floor(timeLeft! / 60000)}:
                {String(Math.floor((timeLeft! % 60000) / 1000)).padStart(2, '0')}
              </p>
            </div>
          )}

          {/* Only host can see the Start button */}
          {isHost && room.status === 'waiting' && (
            <Button 
              onClick={startQuiz} 
              disabled={isCountdownRunning}
            >
              Start Quiz
            </Button>
          )}

          {timeLeft === 0 && <p>Quiz starting...</p>}
        </CardContent>
      </Card>
    </div>
  );
}

