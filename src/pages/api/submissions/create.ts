import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { execFile } from 'child_process';
import { promisify } from 'util';

// Tell Next.js not to parse the form automatically
export const config = {
  api: {
    bodyParser: false,
  },
};

const exec = promisify(execFile);

// Configure paths
export const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');
const PYTHON_SCRIPT_PATH = path.join(process.cwd(), 'scripts/saveGenerator/generateMapSave.py');

// Create directories if they don't exist
export const ensureDir = async (dirPath: string) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
  }
};

// Initialize directories
Promise.all([
  ensureDir(path.join(UPLOAD_DIR, 'screenshots')),
  ensureDir(path.join(UPLOAD_DIR, 'saves')),
  ensureDir(path.join(UPLOAD_DIR, 'popcounts')),
  ensureDir(path.join(UPLOAD_DIR, 'temp')),
]);

// File processing functions
const processSaveFile = async (
  inputPath: string, 
  mapName: string, 
  saveFilename: string,
  popcountFilename: string
) => {
  const savePath = path.join(UPLOAD_DIR, 'saves', saveFilename);
  const popcountPath = path.join(UPLOAD_DIR, 'popcounts', popcountFilename);
  
  try {
    await exec('python', [
      PYTHON_SCRIPT_PATH,
      inputPath,
      mapName,
      savePath,
      popcountPath,
    ]);
    
    return { savePath, popcountPath };
  } finally {
    // Clean up original upload
    await fs.unlink(inputPath).catch(() => {});
  }
};

export const moveFile = async (file: formidable.File, targetDir: string) => {
  const newPath = path.join(targetDir, path.basename(file.filepath));
  await fs.rename(file.filepath, newPath);
  return newPath;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await ensureDir(UPLOAD_DIR);

    const form = formidable({
      multiples: true,
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
      filter: (part) => {
        if (!part.originalFilename) return true;
        const ext = path.extname(part.originalFilename).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.save'].includes(ext);
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

    console.log(fields);

    const btd6MapId = fields.btd6MapId?.[0] as string;
    const gameTypeId = fields.gameTypeId?.[0] as string;
    const highestRound = parseInt(fields.highestRound?.[0] as string, 10);
    const version = fields.version?.[0] as string;
    const numberPlayers = fields.numberPlayers ? parseInt(fields.numberPlayers[0] as string, 10) : 1;
    const seed = fields.seed?.[0] as string;
    const mediaLink = fields.mediaLink?.[0] as string;
    const additionalNotes = fields.additionalNotes?.[0] as string;
    const heroIds = fields.heroIds?.[0] as string;
    const challengeIds = fields.challengeIds?.[0] as string;
    if (!btd6MapId || !gameTypeId || !highestRound || isNaN(highestRound)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Process files
    let screenshotPath: string | null = null;
    let processedSavePath: string | null = null;
    let popcountPath: string | null = null;

    if (files.screenshot?.[0]) {
      screenshotPath = await moveFile(
        files.screenshot[0],
        path.join(UPLOAD_DIR, 'screenshots')
      );

      screenshotPath = path.relative(
        path.join(process.cwd(), 'public'),
        screenshotPath
      );
    }

    if (files.saveFile?.[0]) {
      const saveFile = files.saveFile[0];
      const outputFilename = `${Date.now()}.save`;
      const popcountFilename = `${Date.now()}.csv`;

      const btd6MapData = await prisma.bTD6Map.findUniqueOrThrow({
        where: {
          id: btd6MapId
        }
      });

      const { savePath: sPath, popcountPath: pPath } = await processSaveFile(
        saveFile.filepath,
        btd6MapData.name.replaceAll(' ', '').replaceAll('\'', ''),
        outputFilename,
        popcountFilename,
      );
      processedSavePath = path.relative(
        path.join(process.cwd(), 'public'),
        sPath
      );
      popcountPath = path.relative(
        path.join(process.cwd(), 'public'),
        pPath
      );
    }

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        userId: session.user.id,
        btd6MapId: btd6MapId,
        gameTypeId: gameTypeId,
        highestRound: highestRound,
        version: version,
        players: numberPlayers,
        seed: seed,
        mediaLink: mediaLink,
        additionalNotes: additionalNotes,
        screenshotPath,
        saveFilePath: processedSavePath,
        popcountFilePath: popcountPath,
        challenges: {
          connect: (challengeIds).split(',').map((id => ({ id }))),
        },
        heroes: {
          connect: (heroIds).split(',').map((id => ({ id }))),
        }
      },
    });

    console.log(submission);

    return res.status(200).json({
      message: 'Submission received successfully',
      submissionId: submission.id,
      files: {
        screenshot: screenshotPath ? `/uploads/${screenshotPath}` : null,
        saveFile: processedSavePath ? `/uploads/${processedSavePath}` : null
      }
    });

  } catch (error) {
    console.error('Submission error:', error);
    
    // Custom error handling
    let errorMessage = 'Failed to process submission';
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'Invalid game parameters provided';
      }
      else if (error.message.includes('maxFileSize')) {
        errorMessage = 'File size exceeds 10MB limit';
      }
    }

    return res.status(500).json({ 
      message: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}