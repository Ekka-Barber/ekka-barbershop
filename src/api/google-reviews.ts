import { NextApiRequest, NextApiResponse } from 'next';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { placeId } = req.query;

  if (!placeId) {
    return res.status(400).json({ message: 'Place ID is required' });
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return res.status(500).json({ message: 'Google Places API key is not configured' });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${GOOGLE_PLACES_API_KEY}`
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(400).json({ message: 'Failed to fetch reviews' });
    }

    return res.status(200).json({ reviews: data.result.reviews });
  } catch (error) {
    console.error('Error fetching Google Reviews:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 
