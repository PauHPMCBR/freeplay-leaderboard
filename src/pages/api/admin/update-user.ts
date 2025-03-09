// pages/api/admin/update-user.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  const currentUser = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { admin: true }
  })

  if (!currentUser?.admin) return res.status(403).json({ error: 'Unauthorized' })

  const { userId, admin, verifier } = req.body
  
  // Prevent self-admin removal
  if (userId === session?.user?.id && admin === false) {
    return res.status(400).json({ error: 'Cannot remove your own admin status' })
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { admin, verifier },
      select: { id: true, admin: true, verifier: true }
    })

    res.json(updatedUser)
  } catch (error) {
    res.status(500).json({ error: 'Update failed: ' + error })
  }
}