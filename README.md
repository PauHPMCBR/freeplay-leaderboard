# BTD6 Leaderboard

## Prerequisites
- Have [Docker Desktop](https://www.docker.com/) installed
- Have [NodeJS](https://nodejs.org/en/download) installed

## Development Setup

1. **Install Dependencies:**
```bash
npm install
```

2. **Set up Environment Variables:**
Create `.env` file and add the following content:
```env
DATABASE_URL="postgresql://btd6_admin:strongpassword1298@localhost:5432/btd6_leaderboard?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-secret-here" # add a secure random string
GITHUB_ID=your_github_oauth_id 
GITHUB_SECRET=your_github_oauth_secret
GOOGLE_CLIENT_ID=your_google_oauth_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

Generate a secure password for NEXTAUTH_SECRET

The Github and Google ID+Secret are for setting up sign in options. For Google:

Guide on how to [create Google OAuth client](https://support.google.com/cloud/answer/15549257?hl=en&visit_id=638773011998070795-3320592552) (your website will be "https://localhost").

The users logged in with any admin email will be granted administrator on first sign in.


3. **Start Database:**
```bash
npm run docker:up -d
```

For adding initial entries to the database, run:
```bash
npm run prisma:seed
```

4. **Run Migrations:**
When a database model changes, run:
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
- **Seed Test Data:** `npm run prisma:seed`
- **Production Build:** `npm run build && npm start`