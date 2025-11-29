# Quiz App Design

## Architecture

- **Frontend**: Next.js with React components, App Router
- **Styling**: Tailwind CSS + Shadcn UI component library
- **Backend**: MongoDB (database), NextAuth.js (authentication), Socket.io (real-time subscriptions)
- **Deployment**: Vercel (recommended for Next.js)

## Database Schema

Using MongoDB:

### Collections

- **users**
  - \_id (ObjectId, primary key)
  - email (string, unique)
  - username (string, unique)
  - password (string, hashed)
  - createdAt (Date)

- **rooms**
  - \_id (ObjectId, primary key)
  - code (string, unique, 6-character)
  - hostId (ObjectId, reference to users)
  - title (string)
  - settings (object: {timeLimit: number, maxParticipants: number})
  - status (string: waiting, active, finished)
  - createdAt (Date)

- **questions**
  - \_id (ObjectId, primary key)
  - roomId (ObjectId, reference to rooms)
  - questionText (string)
  - options (array: [{text: string, id: string}])
  - correctAnswer (string, option id)
  - order (number)

- **participants**
  - \_id (ObjectId, primary key)
  - roomId (ObjectId, reference to rooms)
  - userId (ObjectId, reference to users, nullable for guests)
  - username (string, for guests)
  - joinedAt (Date)

- **answers**
  - \_id (ObjectId, primary key)
  - participantId (ObjectId, reference to participants)
  - questionId (ObjectId, reference to questions)
  - selectedOption (string)
  - isCorrect (boolean)
  - submittedAt (Date)

## UI Design

- **Landing Page**: Hero section with "Create Room" and "Join Room" buttons
- **Create Room**: Multi-step form - Room details, Add questions, Review
- **Join Room**: Input for room code, display room info
- **Waiting Room**: Participant list, chat (optional), Start Quiz button for host
- **Quiz Page**:
  - Top: Live leaderboard (rank, name, score)
  - Center: Question text, 4 option buttons
  - Bottom: Timer, progress indicator
- **Results Page**: Final leaderboard, expandable user details showing answers per question

## Real-time Features

- Socket.io for real-time subscriptions:
  - Room updates (new participants, status changes)
  - Answer submissions (update leaderboard)
  - Quiz progression (next question)

## Component Structure

- **Layout**: Header, Footer
- **Forms**: RoomForm, QuestionForm
- **Quiz**: Leaderboard, QuestionCard, Timer
- **Results**: FinalLeaderboard, UserResults

## Security Considerations

- Server-side validation of answers
- Rate limiting for submissions
- Room codes are unique and not guessable
