import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const btd6MapId = req.query.id as string;

  try {
    const btd6Map = await prisma.bTD6Map.findUnique({
      where: { id: btd6MapId },
    });

    if (!btd6Map) return res.status(404).json({ error: 'BTD6Map not found' })
    
    res.status(200).json(btd6Map);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch btd6 map data: ' + error })
  }
}