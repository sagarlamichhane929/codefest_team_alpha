'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <h1 className="text-4xl font-bold">Quiz App</h1>
        {session ? (
          <div className="text-center">
            <p>Welcome, {session.user?.name}!</p>
            <div className="flex gap-4 mt-4">
              <Link href="/create-room">
                <Button>Create Room</Button>
              </Link>
              <Link href="/join-room">
                <Button variant="secondary">Join Room</Button>
              </Link>
            </div>
            <Button onClick={() => signOut()} variant="outline" className="mt-4">Sign Out</Button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Register</Button>
            </Link>
            <Link href="/join-room">
              <Button variant="secondary">Join Room</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}