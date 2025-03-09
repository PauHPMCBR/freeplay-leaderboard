import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const gameTypeId = req.query.id as string;

  try {
    const gameType = await prisma.gameType.findUnique({
      where: { id: gameTypeId },
    });

    if (!gameType) return res.status(404).json({ error: 'gameType not found' })
    
    res.status(200).json(gameType);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gameType data: ' + error })
  }
}