// pages/api/admin/users.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { admin: true }
  });

  if (!user || !user.admin) return res.status(403).json({ error: 'Unauthorized' })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      admin: true,
      verifier: true,
      createdAt: true
    }
  })

  res.json(users)
}