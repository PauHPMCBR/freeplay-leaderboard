import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';

const exec = promisify(execFile);

const PYTHON_SCRIPT_PATH = path.join(process.cwd(), 'scripts/saveGenerator/processSaveFile.py');

// Create directories if they don't exist
export const ensureDir = async (dirPath: string) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
  }
};

// File processing functions
export const processSaveFile = async (
  inputPath: string, 
  mapName: string,
  savePath?: string,
  popcountPath?: string
) => {
  try {
    const args = [
      PYTHON_SCRIPT_PATH,
      inputPath,
      mapName,
    ];

    if (savePath) {
      await ensureDir(savePath);
      args.push(savePath);
    }
    if (popcountPath) {
      await ensureDir(popcountPath);
      args.push(popcountPath);
    }

    const { stdout } = await exec('python', args);
    const seed = stdout.trim();  // Assuming Python script outputs seed as first line

    return seed;
    
  } finally {
    // Clean up original upload
    await fs.unlink(inputPath).catch(() => {});
  }
};