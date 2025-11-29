'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QRCode from 'react-qr-code';

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
    endTime: string;
  };
}

export default function DashboardPage() {
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
            Dashboard for {room.title} - Code: {code}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h4 className="font-semibold">Room Overview</h4>
            <p>Status: {room.status}</p>
            <p>
              Start Time: {new Date(room.settings.startTime).toLocaleString()}
            </p>
            <p>End Time: {new Date(room.settings.endTime).toLocaleString()}</p>
            <p>Total Participants: {room.participants.length}</p>
            <div className="mt-2">
              <p>
                Room Code: <strong>{code}</strong>
              </p>
              <Button
                onClick={() => navigator.clipboard.writeText(code)}
                className="mr-2"
              >
                Copy Code
              </Button>
              <div className="mt-2">
                <QRCode
                  value={`${window.location.origin}/join-room?code=${code}`}
                  size={128}
                />
              </div>
            </div>
          </div>
          <h3>Participants ({room.participants.length}):</h3>
          <ul className="list-disc pl-5">
            {room.participants.map((p) => (
              <li key={p._id}>{p.username}</li>
            ))}
          </ul>

          {isCountdownRunning && (
            <div className="mt-4">
              <h4>Quiz starts in:</h4>
              <p>
                {Math.floor(timeLeft! / 60000)}:
                {String(Math.floor((timeLeft! % 60000) / 1000)).padStart(
                  2,
                  '0'
                )}
              </p>
            </div>
          )}

          {/* {isHost && room.status === 'waiting' && (
            <Button
              onClick={startQuiz}
              disabled={isCountdownRunning}
              className="mt-4"
            >
              Start Quiz
            </Button>
          )} */}

          {room.status === 'active' && (
            <div className="mt-4">
              <p>Quiz is active. Participants are taking the quiz.</p>
              <Button
                onClick={() => (window.location.href = `/results/${code}`)}
              >
                View Results
              </Button>
            </div>
          )}

          {timeLeft === 0 && <p>Quiz starting...</p>}
        </CardContent>
      </Card>
    </div>
  );
}
