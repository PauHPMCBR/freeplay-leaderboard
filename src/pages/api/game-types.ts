import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get all game types from the database model
    const gameTypes = await prisma.gameType.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json({ gameTypes });
  } catch (error) {
    console.error('Error fetching game types:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch game types',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}