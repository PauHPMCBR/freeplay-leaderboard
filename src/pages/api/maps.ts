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
    // Get all BTD6 maps from the database model
    const maps = await prisma.bTD6Map.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json({ maps });
  } catch (error) {
    console.error('Error fetching maps:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch maps',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}