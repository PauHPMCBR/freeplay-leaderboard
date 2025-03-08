import { getServerSession } from 'next-auth/next'
import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]'
import formidable from 'formidable'
import path from 'path'
import { ensureDir, moveFile, UPLOAD_DIR } from '../submissions/create'

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await ensureDir(path.join(UPLOAD_DIR, 'avatars'));
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const form = formidable({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      //filename: (name, ext) => `${session.user.id}-${Date.now()}${ext}`,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter: (part) => {
        if (!part.originalFilename) return true;
        const ext = path.extname(part.originalFilename).toLowerCase();
        return ['.jpg', '.jpeg', '.png'].includes(ext);
      }
    })

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
        (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err)
          resolve([fields, files])
        });
      }
    );

    console.log(fields, files, UPLOAD_DIR);

    // Validate and process image
    let imagePath: string | null = null;
    if (files.image?.[0]) {
      imagePath = await moveFile(
        files.image[0],
        path.join(UPLOAD_DIR, 'avatars')
      );
      imagePath = path.relative(
        path.join(process.cwd(), 'public'),
        imagePath
      );
    }

    console.log(imagePath);

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: fields.name?.[0] || session.user.name,
        image: imagePath ?? session.user.image,
        youtubeChannel: fields.youtubeChannel?.[0],
        discordId: fields.discordId?.[0],
        additionalNotes: fields.additionalNotes?.[0]
      }
    });

    res.status(200).json({
      success: true,
      imageUrl: updatedUser.image ? `/uploads/${imagePath}` : null,
    });

  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to update profile'
    })
  }
}