'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Result {
  username: string;
  participantId: string;
  score: number;
  totalAttempts: number;
  answers: {
    question: string;
    options: { text: string; id: string }[];
    selected: string;
    correct: boolean;
    correctAnswer: string;
    explanation: string;
  }[];
}

interface QuestionStat {
  question: string;
  correct: number;
  total: number;
}

export default function ResultsPage() {
  const params = useParams();
  const code = params.code as string;
  const [results, setResults] = useState<Result[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStat[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchResults = async () => {
    const response = await fetch(`/api/rooms/${code}/results`);
    if (response.ok) {
      const data = await response.json();
      setResults(data.results);
      setQuestionStats(data.questionStats);
    }
  };

  const fetchRoom = async () => {
    const response = await fetch(`/api/rooms/${code}/details`);
    if (response.ok) {
      const data = await response.json();
      setRoom(data.room);
    }
  };

  useEffect(() => {
    fetchResults();
    fetchRoom();
    setParticipantId(localStorage.getItem('participantId'));
  }, [code]);

  if (!room) return <div>Loading...</div>;

  const isHost = room.hostId === session?.user?.id;
  const top3 = results.slice(0, 3);
  const ownResult =
    results.find((r) => r.username === session?.user?.name) ||
    (participantId
      ? results.find((r) => r.participantId === participantId)
      : null);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Top 3 Scorers</CardTitle>
        </CardHeader>
        <CardContent>
          {top3.map((r, i) => (
            <div key={i} className="mb-4">
              <h3>
                {i + 1}. {r.username} - {r.score} points, {r.totalAttempts}{' '}
                attempts
              </h3>
            </div>
          ))}
        </CardContent>
      </Card>

      {ownResult && (
        <Card>
          <CardHeader>
            <CardTitle>Your Results</CardTitle>
          </CardHeader>
          <CardContent>
            <h3>
              {ownResult.username} - {ownResult.score} points,{' '}
              {ownResult.totalAttempts} attempts
            </h3>
            <div className="space-y-4">
              {ownResult.answers.map((a, j) => (
                <div key={j} className="border p-4 rounded">
                  <h4 className="font-bold">{a.question}</h4>
                  <div className="space-y-2 mt-2">
                    {a.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-2 rounded ${
                          opt.id === a.selected
                            ? a.correct
                              ? 'bg-green-200'
                              : 'bg-red-200'
                            : opt.text === a.correctAnswer
                              ? 'bg-green-200 font-bold'
                              : ''
                        }`}
                      >
                        {opt.text}
                      </div>
                    ))}
                  </div>
                  {a.explanation && (
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Explanation:</strong> {a.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isHost && (
        <Card>
          <CardHeader>
            <CardTitle>Full Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            {results.map((r, i) => (
              <div key={i} className="mb-4">
                <h3>
                  {i + 1}. {r.username} - {r.score} points, {r.totalAttempts}{' '}
                  attempts
                </h3>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Question Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {questionStats.map((q, i) => (
            <div key={i} className="mb-2">
              <strong>{q.question}</strong>
              <br />
              Correct: {q.correct}, Failed: {q.total - q.correct}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
