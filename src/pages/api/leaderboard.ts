import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export type SubmissionSummary = {
  submissionId: string,
  round: number,
  user: string,
  btd6Map: string,
  gameType: string,
  heroNames: string[],
  challenges: string[],
  createdAt: Date,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { btd6Map, gameType } = req.query

  console.log(btd6Map, gameType)

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};
    
    if (btd6Map && btd6Map !== '') {
      whereClause.btd6MapId = btd6Map;
    }
    
    if (gameType && gameType !== '') {
      whereClause.gameTypeId = gameType;
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      include: {
        user: true,
        btd6Map: true,
        gameType: true,
        heroes: true,
        challenges: true,
      },
      orderBy: { highestRound: 'desc' },
      take: 100 // Limit results to prevent massive data returns
    });

    const submissionsSummary: SubmissionSummary[] = submissions.map(submission => ({
      submissionId: submission.id,
      round: submission.highestRound,
      user: submission.user.name,
      btd6Map: submission.btd6Map.name,
      gameType: submission.gameType.name,
      heroNames: submission.heroes.map(hero => hero.name),
      challenges: submission.challenges.map(c => c.name),
      createdAt: submission.createdAt
    }));

    res.status(200).json(submissionsSummary);

  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard data'
    })
  }
}