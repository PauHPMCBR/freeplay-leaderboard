import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import formidable from 'formidable';
import path from 'path';
import { ensureDir, processSaveFile } from '@/lib/saveFileManager';

// Tell Next.js not to parse the form automatically
export const config = {
  api: {
    bodyParser: false,
  },
};

export const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    await ensureDir(UPLOAD_DIR);

    const form = formidable({
      multiples: false,
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
      filter: (part) => {
        if (!part.originalFilename) return true;
        const ext = path.extname(part.originalFilename).toLowerCase();
        return ['.save'].includes(ext);
      }
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      }
    );

    if (!files.saveFile || !fields.btd6MapId) {
      return res.status(500).json({ 
        message: "No save file or mapId was specified",
        error: "No save file or mapId was specified"
      });
    }

    const saveFile = files.saveFile[0];
    const btd6MapData = await prisma.bTD6Map.findUniqueOrThrow({
      where: {
        id: fields.btd6MapId?.[0] as string
      }
    });
    
    const seed = await processSaveFile(
      saveFile.filepath,
      btd6MapData.name.replaceAll(' ', '').replaceAll('\'', ''),
    );
    
    return res.status(200).json({
      message: 'Submission received successfully',
      seed: seed,
    });

  } catch (error) {
    console.error('Seed from save error:', error);
    return res.status(500).json({ 
      message: 'Failed to process save file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }


}