import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    port: process.env.PORT || '9002',
    env: process.env.NODE_ENV 
  });
}
