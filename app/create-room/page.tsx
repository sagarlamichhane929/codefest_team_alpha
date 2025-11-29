'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const questionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  options: z
    .array(
      z.object({
        text: z.string().min(1, 'Option text is required'),
        id: z.string(),
      })
    )
    .length(4, 'Must have exactly 4 options'),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  explanation: z.string().optional(),
});

const roomSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  timeLimit: z.number().optional(),
  maxParticipants: z.number().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  questions: z.array(questionSchema),
});

type RoomForm = z.infer<typeof roomSchema>;

export default function CreateRoom() {
  const [step, setStep] = useState(1);
  const [syllabus, setSyllabus] = useState('');
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RoomForm>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      startTime: '',
      endTime: '',
      questions: [
        {
          questionText: '',
          options: [
            { text: '', id: 'a' },
            { text: '', id: 'b' },
            { text: '', id: 'c' },
            { text: '', id: 'd' },
          ],
          correctAnswer: '',
          explanation: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const onSubmit = async (data) => {
    if (step === 1) {
      if (!data.questions || data.questions.length === 0) {
        toast.error('At least one question is required');
        return;
      }
      // Check if all questions are filled
      for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i];
        if (
          !q.questionText ||
          q.options.some((o) => !o.text) ||
          !q.correctAnswer
        ) {
          toast.error(`Question ${i + 1} is incomplete`);
          return;
        }
      }
      setStep(2);
    } else {
      // submit
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const { code } = await response.json();
        toast.success(`Room created! Code: ${code}`);
        // redirect or something
      } else {
        toast.error('Error creating room');
      }
    }
  };

  const onInvalid = (errors: any) => {
    console.log('Form invalid', errors);
  };

  const addQuestion = () => {
    console.log('Adding question');
    append({
      questionText: '',
      options: [
        { text: '', id: 'a' },
        { text: '', id: 'b' },
        { text: '', id: 'c' },
        { text: '', id: 'd' },
      ],
      correctAnswer: '',
      explanation: '',
    });
  };

  const generateQuestions = async () => {
    if (!syllabus.trim()) {
      toast.error('Please enter a syllabus');
      return;
    }
    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ syllabus }),
    });
    if (response.ok) {
      const { questions } = await response.json();
      const current = watch('questions') || [];
      setValue('questions', [...current, ...questions]);
      toast.success('Questions generated successfully!');
    } else {
      toast.error('Failed to generate questions');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Quiz Room - Step {step}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="title">Room Title</label>
                  <Input id="title" {...register('title')} />
                  {errors.title && (
                    <p className="text-red-500">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="timeLimit">
                    Time Limit per Question (seconds)
                  </label>
                  <Input
                    id="timeLimit"
                    type="number"
                    {...register('timeLimit', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label htmlFor="maxParticipants">Max Participants</label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    {...register('maxParticipants', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label htmlFor="startTime">Quiz Start Time</label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    {...register('startTime')}
                  />
                  {errors.startTime && (
                    <p className="text-red-500">{errors.startTime.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="endTime">Quiz End Time</label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    {...register('endTime')}
                  />
                  {errors.endTime && (
                    <p className="text-red-500">{errors.endTime.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="syllabus">Syllabus (for AI generation)</label>
                  <Input
                    id="syllabus"
                    value={syllabus}
                    onChange={(e) => setSyllabus(e.target.value)}
                    placeholder="Enter syllabus or topic to generate questions"
                  />
                  <Button
                    type="button"
                    onClick={generateQuestions}
                    className="mt-2"
                  >
                    Generate Questions with AI
                  </Button>
                </div>
                <h2>Add Questions</h2>
                {fields.map((field, index) => (
                  <div key={field.id} className="border p-4 rounded">
                    <div>
                      <label>Question {index + 1}</label>
                      <Input
                        {...register(`questions.${index}.questionText`)}
                        placeholder="Question text"
                      />
                      {errors.questions?.[index]?.questionText && (
                        <p className="text-red-500">
                          {errors.questions[index].questionText.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['a', 'b', 'c', 'd'].map((id, optIndex) => (
                        <div key={id}>
                          <label>Option {id.toUpperCase()}</label>
                          <Input
                            {...register(
                              `questions.${index}.options.${optIndex}.text`
                            )}
                            placeholder={`Option ${id.toUpperCase()}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <label>Correct Answer</label>
                      <select
                        {...register(`questions.${index}.correctAnswer`)}
                        className="border p-2 rounded"
                      >
                        <option value="">Select</option>
                        <option value="a">A</option>
                        <option value="b">B</option>
                        <option value="c">C</option>
                        <option value="d">D</option>
                      </select>
                      {errors.questions?.[index]?.correctAnswer && (
                        <p className="text-red-500">
                          {errors.questions[index].correctAnswer.message}
                        </p>
                      )}
                    </div>
                    <div className="mt-2">
                      <label>Explanation (optional)</label>
                      <Input
                        {...register(`questions.${index}.explanation`)}
                        placeholder="Reason for the correct answer"
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        variant="destructive"
                        className="mt-2"
                      >
                        Remove Question
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" onClick={addQuestion}>
                  Add Question
                </Button>
                <div className="flex gap-2 mt-4">
                  <Button type="submit">Next: Review</Button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <h2>Review</h2>
                <p>Title: {watch('title')}</p>
                <p>Questions: {watch('questions')?.length}</p>
                {/* More details */}
                <div className="flex gap-2">
                  <Button type="button" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit">Create Room</Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
