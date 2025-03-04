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
    // Get all BTD6 heroes from the database model
    const heroes = await prisma.hero.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json({ heroes });
  } catch (error) {
    console.error('Error fetching heroes:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch heroes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}