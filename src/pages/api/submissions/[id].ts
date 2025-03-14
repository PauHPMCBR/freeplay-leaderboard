import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { BTD6Map, Challenge, GameType, Hero, User } from '@prisma/client';

export type SubmissionDetailed = {
  submissionId: string,
  highestRound: number,
  user: User,
  btd6Map: BTD6Map,
  gameType: GameType,
  heroes: Hero[],
  version: string,
  players: number,
  seed?: string,
  challenges: Challenge[],
  mediaLink?: string,
  screenshotPath?: string,
  saveFilePath?: string,
  popcountFilePath?: string,
  additionalNotes?: string,
  additionalVerifierNotes?: string,
  verified: boolean,
  verifierId?: string,
  createdAt: Date,
  updatedAt: Date,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const submissionId = req.query.id;

  try {
    if (typeof(submissionId) !== "string") {
      throw new Error("Query is not a string for sumbissionId");
    }

    const submission = await prisma.submission.findUnique({
      where: {
        id: submissionId
      },
      include: {
        user: true,
        btd6Map: true,
        gameType: true,
        heroes: true,
        challenges: true,
      },
    });

    if (!submission) {
      throw new Error("Specified submission does not exist");
    }

    const submissionDetails: SubmissionDetailed = {
      submissionId: submission.id,
      highestRound: submission.highestRound,
      user: submission.user,
      btd6Map: submission.btd6Map,
      gameType: submission.gameType,
      heroes: submission.heroes,
      version: submission.version,
      players: submission.players,
      seed: submission.seed ?? undefined,
      challenges: submission.challenges,
      mediaLink: submission.mediaLink ?? undefined,
      screenshotPath: submission.screenshotPath ?? undefined,
      saveFilePath: submission.saveFilePath ?? undefined,
      popcountFilePath: submission.popcountFilePath ?? undefined,
      additionalNotes: submission.additionalNotes ?? undefined,
      additionalVerifierNotes: submission.additionalVerifierNotes ?? undefined,
      verified: submission.verified,
      verifierId: submission.verifierId ?? undefined,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    }

    res.status(200).json(submissionDetails);

  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard data'
    })
  }
}