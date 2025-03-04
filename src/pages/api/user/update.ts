import { getServerSession } from 'next-auth/next'
import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: req.body.name }
  })

  res.status(200).json({ success: true })
}