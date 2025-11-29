import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth';

export async function GET() {
  const providers = authConfig.providers.reduce(
    (acc, provider) => {
      acc[provider.id] = {
        id: provider.id,
        name: provider.name,
        type: provider.type,
        signinUrl: `/api/auth/signin/${provider.id}`,
        callbackUrl: `/api/auth/callback/${provider.id}`,
      };
      return acc;
    },
    {} as Record<string, any>
  );
  return NextResponse.json(providers);
}
