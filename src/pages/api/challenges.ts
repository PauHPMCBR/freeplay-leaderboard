import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get the mapId and gameTypeId from query parameters
  const { mapId, gameTypeId } = req.query;

  // Validate required parameters
  if (!mapId || typeof mapId !== 'string' || !gameTypeId || typeof gameTypeId !== 'string') {
    return res.status(400).json({
      message: 'mapId and gameTypeId parameters are required',
    });
  }

  try {
    // Find challenges that are available for the given map and game type
    const challenges = await prisma.challenge.findMany({
      where: {
        btd6Maps: {
          some: {
            id: mapId,
          },
        },
        gameTypes: {
          some: {
            id: gameTypeId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json({ challenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch challenges',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}