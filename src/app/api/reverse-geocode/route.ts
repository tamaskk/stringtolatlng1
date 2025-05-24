import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lat, lng } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // You'll need to set this environment variable with your Google Maps API key
    const apiKey = 'AIzaSyCTlKbNEPiDQE8SFtRRVqQLhJFFqZhMrps';
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key is not configured' },
        { status: 500 }
      );
    }

    const response = await client.reverseGeocode({
      params: {
        latlng: `${lat},${lng}`,
        key: apiKey,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      const address = response.data.results[0].formatted_address;
      return NextResponse.json({ address });
    } else {
      return NextResponse.json(
        { error: 'No address found for these coordinates' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to reverse geocode coordinates' },
      { status: 500 }
    );
  }
} 