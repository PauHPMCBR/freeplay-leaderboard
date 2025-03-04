# BTD6 Leaderboard

## Development Setup

1. **Install Dependencies:**
```bash
npm install
```

2. **Set up Environment Variables:**
Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/btd6_leaderboard?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-secret-here"
GITHUB_ID=your_github_oauth_id
GITHUB_SECRET=your_github_oauth_secret
```

3. **Start Database:**
```bash
npm run docker:up -d
```

4. **Run Migrations:**
```bash
npm run prisma:migrate
```

5. **Start Development Server:**
```bash
npm run dev
```

## Common Commands

- **Reset Database:** `npm run docker:reset && npm run prisma:migrate`
- **Prisma Studio (DB GUI):** `npm run prisma:studio`
- **Seed Test Data:** `npm run seed`
- **Production Build:** `npm run build && npm start`