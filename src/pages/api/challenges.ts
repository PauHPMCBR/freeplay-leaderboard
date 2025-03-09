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
  const { btd6Map, gameType } = req.query;

  try {
    const whereClause: {
      btd6Maps?: { some: { id: string } },
      gameTypes?: { some: { id: string } }
    } = {};
    
    if (btd6Map && btd6Map !== '') {
      whereClause.btd6Maps = { some: { id: btd6Map as string } };
    }
    
    if (gameType && gameType !== '') {
      whereClause.gameTypes = { some: { id: gameType as string } };
    }
  
    // Find challenges that are available for BOTH the given map and game type
    const challenges = await prisma.challenge.findMany({
      where: whereClause,
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