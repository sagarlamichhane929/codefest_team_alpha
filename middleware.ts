import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware() {
    // add logic if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { matcher: ['/create-room'] }; // protect create room, join can be guest
