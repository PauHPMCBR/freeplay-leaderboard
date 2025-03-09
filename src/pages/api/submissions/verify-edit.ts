// pages/api/admin/update-user.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]'
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user || !session?.user.verifier) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  
  const form = formidable();

  const [fields] = await new Promise<[formidable.Fields]>(
    (resolve, reject) => {
      form.parse(req, (err, fields) => {
        if (err) reject(err);
        resolve([fields]);
      });
    }
  );

  console.log(fields);

  const submissionId = fields.submissionId?.[0] as string;
  const verified = fields.verified?.[0] as string;
  const verifierNotes = fields.verifierNotes?.[0] as string;
  
  try {
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: { 
        verified: verified == "true", 
        verifierId: session.user.id,
        additionalVerifierNotes: verifierNotes
      },
      select: { id: true, verified: true, verifierId: true, additionalVerifierNotes: true }
    })

    res.json(updatedSubmission);
  } catch (error) {
    res.status(500).json({ error: 'Update failed: ' + error })
  }
}