import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/images/[imageId]/comments
export async function GET(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const imageId = params.imageId;
    
    // Call the backend API to get comments
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    console.log(`Fetching comments from: ${backendUrl}/images/${imageId}/comments`);
    
    const response = await fetch(`${backendUrl}/images/${imageId}/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response from backend: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { comments: [] },
      { status: 200 }
    );
  }
}

// POST /api/images/[imageId]/comments
export async function POST(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const imageId = params.imageId;
    const body = await request.json();
    
    // Call the backend API to create a comment
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    console.log(`Creating comment at: ${backendUrl}/images/${imageId}/comments`);
    
    const response = await fetch(`${backendUrl}/images/${imageId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text: body.text,
        userId: body.userId,
        userName: body.userName
      }),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response from backend: ${response.status} - ${errorText}`);
      throw new Error(`Failed to create comment: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json({ comment: data });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
} 