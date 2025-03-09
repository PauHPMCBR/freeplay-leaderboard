import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const heroId = req.query.id as string;

  try {
    const hero = await prisma.hero.findUnique({
      where: { id: heroId },
    });

    if (!hero) return res.status(404).json({ error: 'hero not found' })
    
    res.status(200).json(hero);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hero data: ' + error })
  }
}