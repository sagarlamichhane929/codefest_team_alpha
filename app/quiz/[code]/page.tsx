'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Question {
  _id: string;
  questionText: string;
  options: { text: string; id: string }[];
}

interface Answer {
  participantId: string;
  username: string;
  isCorrect: boolean;
}

export default function QuizPage() {
  const params = useParams();
  const code = params.code as string;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);

  const currentQuestion = questions.length > 0 ? questions[currentIndex] : null;

  const fetchQuestions = useCallback(async () => {
    const response = await fetch(`/api/rooms/${code}/questions`);
    if (response.ok) {
      const data = await response.json();
      setQuestions(data.questions);
      // set time if any
    }
  }, [code]);

  const fetchLeaderboard = useCallback(async () => {
    const response = await fetch(`/api/rooms/${code}/leaderboard`);
    if (response.ok) {
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    }
  }, [code]);

  const fetchRoomDetails = useCallback(async () => {
    const response = await fetch(`/api/rooms/${code}/details`);
    if (response.ok) {
      const data = await response.json();
      setEndTime(new Date(data.room.settings.endTime));
    }
  }, [code]);

  const submitAnswer = async () => {
    if (!selected || !participantId) return;
    const response = await fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        questionId: currentQuestion._id,
        selectedOption: selected,
        participantId,
      }),
    });
    if (response.ok) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelected('');
        setTimeLeft(null);
      } else {
        window.location.href = `/results/${code}`;
      }
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchLeaderboard();
    fetchRoomDetails();
    setParticipantId(localStorage.getItem('participantId'));
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [code, fetchQuestions, fetchLeaderboard, fetchRoomDetails]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      submitAnswer();
    }
  }, [timeLeft, submitAnswer]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (endTime && Date.now() > endTime.getTime()) {
      window.location.href = `/results/${code}`;
    }
  }, [endTime, code]);

  if (questions.length === 0) return <div>Loading...</div>;

  if (countdown > 0)
    return (
      <div className="container mx-auto p-4 text-center">
        <h1>Quiz starts in {countdown}...</h1>
      </div>
    );

  const userScores = leaderboard.reduce(
    (acc, ans) => {
      acc[ans.username] = (acc[ans.username] || 0) + (ans.isCorrect ? 1 : 0);
      return acc;
    },
    {} as Record<string, number>
  );

  const topUsers = Object.entries(userScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              {topUsers.map(([username, score], i) => (
                <div key={i}>
                  {i + 1}. {username}: {score} correct
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Question {currentIndex + 1} of {questions.length}
              </CardTitle>
              {timeLeft !== null && <p>Time left: {timeLeft}s</p>}
            </CardHeader>
            <CardContent>
              <p>{currentQuestion.questionText}</p>
              <div className="space-y-2">
                {currentQuestion.options.map((opt) => (
                  <Button
                    key={opt.id}
                    variant={selected === opt.id ? 'default' : 'outline'}
                    onClick={() => setSelected(opt.id)}
                    className="w-full"
                  >
                    {opt.text}
                  </Button>
                ))}
              </div>
              <Button
                onClick={submitAnswer}
                disabled={!selected}
                className="mt-4"
              >
                Submit Answer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
