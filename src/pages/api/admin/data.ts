// pages/api/admin/data.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

const allowedModels = ['user', 'submission', 'bTD6Map', 'gameType', 'challenge']

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { admin: true }
  })

  if (!user || !user.admin) return res.status(403).json({ error: 'Unauthorized' });

  const model = req.query.model as string
  if (!allowedModels.includes(model)) {
    return res.status(400).json({ error: 'Invalid model' })
  }

  try {
    // @ts-expect-error - Dynamic model access
    const data = await prisma[model].findMany({
      take: 100, // Limit results
      //orderBy: { createdAt: 'desc' }
    })
    
    res.json(data)
  } catch (error) {
    console.log('Failed to fetch data: ' + error);
    res.status(500).json({ error: 'Failed to fetch data: ' + error })
  }
}