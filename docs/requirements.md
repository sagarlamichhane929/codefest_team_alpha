# Quiz App Requirements

## Overview

A web-based quiz application built with Next.js, MongoDB, NextAuth.js, Tailwind CSS, and Shadcn UI. Users can create quiz rooms with questions, join rooms to participate, and compete in real-time with a leaderboard.

## Functional Requirements

### User Management

- Users must be able to register and log in using NextAuth.js with MongoDB
- Support for anonymous users or guest participation

### Room Creation

- Authenticated users can create quiz rooms
- Room creator can add multiple questions to the room
- Each question has: question text, multiple choice options (4 options), correct answer
- Room has a unique code for joining
- Room settings: time limit per question (optional), max participants (optional)

### Joining Rooms

- Users can join a room using the room code
- Display room details before joining (number of questions, creator, etc.)

### Quiz Gameplay

- Real-time quiz session starts when host begins
- Questions displayed one at a time
- Users select answers within time limit
- Leaderboard updates in real-time showing current scores
- Leaderboard shows: rank, username, score

### Quiz End

- Final leaderboard with all participants' scores
- Show each user's attempted questions and their answers (correct/incorrect)
- Option to view detailed results per question

### Additional Features

- Host can end quiz early
- Participants can leave during quiz
- Results persist for later viewing

## Non-Functional Requirements

- Responsive design for mobile and desktop
- Real-time updates using Socket.io
- Secure: no cheating mechanisms, validate answers server-side
- Performance: handle up to 100 concurrent users per room
- Scalability: support multiple rooms simultaneously

## Assumptions

- Questions are multiple choice with 4 options
- No image/media support for questions initially
- Basic scoring: 1 point per correct answer
- No negative marking
{not need to email verification just reister with email name password just verify these when login}