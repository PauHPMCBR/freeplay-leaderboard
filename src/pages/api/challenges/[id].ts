import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const challengeId = req.query.id as string;

  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) return res.status(404).json({ error: 'challenge not found' })
    
    res.status(200).json(challenge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch challenge data: ' + error })
  }
}