import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/utils';

// GET /api/images/[imageId]
export async function GET(
  request: NextRequest,
  context: { params: { imageId: string } }
) {
  try {
    const imageId = context.params.imageId;
    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Call the backend API to get the image
    const backendUrl = getApiUrl();
    console.log(`Fetching image from: ${backendUrl}/images/${imageId}`);
    
    const response = await fetch(`${backendUrl}/images/${imageId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response from backend: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
} 