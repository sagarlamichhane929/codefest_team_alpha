'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Quiz App
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/" className="text-gray-700 hover:text-gray-900">
            Home
          </Link>
          {session ? (
            <>
              <Link
                href="/create-room"
                className="text-gray-700 hover:text-gray-900"
              >
                Create Room
              </Link>
              <Link
                href="/join-room"
                className="text-gray-700 hover:text-gray-900"
              >
                Join Room
              </Link>
              <span className="text-gray-700">Hello, {session.user?.name}</span>
              <Button onClick={() => signOut()} variant="outline">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="text-gray-700 hover:text-gray-900"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
