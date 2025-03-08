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
  verified: boolean,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { btd6Map, gameType, user, orderBy, ascOrder, start, amount } = req.query

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
    if (user && user !== '') {
      whereClause.userId = user;
    }

    const orderByField = (orderBy?.toString() || '').toLowerCase();
    const isAsc = ascOrder === 'true';
    let orderByClause = {};

    switch (orderByField) {
      case 'round':
        orderByClause = { highestRound: isAsc ? 'asc' : 'desc' };
        break;
      case 'user':
        orderByClause = { user: { name: isAsc ? 'asc' : 'desc' } };
        break;
      case 'btd6map':
        orderByClause = { btd6Map: { name: isAsc ? 'asc' : 'desc' } };
        break;
      case 'gametype':
        orderByClause = { gameType: { name: isAsc ? 'asc' : 'desc' } };
        break;
      case 'createdat':
        orderByClause = { createdAt: isAsc ? 'asc' : 'desc' };
        break;
      default:
        orderByClause = { highestRound: 'desc' };
    }

    // Build SKIP and TAKE for pagination
    let skip = 0;
    let take = 100;
    if (start && amount) {
      const startPos = parseInt(start.toString(), 10);
      const amountInt = parseInt(amount.toString(), 10);
      if (!isNaN(startPos) && !isNaN(amountInt) && startPos >= 1 && amountInt >= 1) {
        skip = startPos - 1;
        take = Math.min(amountInt, 100);
      }
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
      orderBy: orderByClause,
      skip,
      take,
    });

    const submissionsSummary: SubmissionSummary[] = submissions.map(submission => ({
      submissionId: submission.id,
      round: submission.highestRound,
      user: submission.user.name,
      btd6Map: submission.btd6Map.name,
      gameType: submission.gameType.name,
      heroNames: submission.heroes.map(hero => hero.name),
      challenges: submission.challenges.map(c => c.name),
      createdAt: submission.createdAt,
      verified: submission.verified,
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