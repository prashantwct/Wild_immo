import { NextResponse } from 'next/server';
// import { register } from '@netlify/next/server';

export async function GET() {
  // This will be used when deploying to Netlify
  if (process.env.NETLIFY) {
    // return register();
  }

  // For local development, we'll just return a success response
  return NextResponse.json({ status: 'Service Worker registration not needed in development' });
}
