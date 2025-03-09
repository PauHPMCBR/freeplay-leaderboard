import NextAuth, { Session, User } from "next-auth";
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/prisma"
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn( { user }: { user: User } ) {
      // Initial admin setup during first sign-in
      if (user.email && process.env.ADMIN_EMAILS?.split(',').includes(user.email)) {
        await prisma.user.update({
          where: { email: user.email },
          data: { admin: true },
        });
      }
      return true;
    },

    async session({ session, user }: { session: Session; token: JWT; user: AdapterUser; }) {
      session.user.id = user.id;
      // Add admin and verifier status to session
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { admin: true, verifier: true }
      });
      session.user.admin = dbUser?.admin || false;
      session.user.verifier = dbUser?.verifier || false;
      return session;
    },
  },
  events: {
    async createUser( { user }: { user: User } ) {
      // Handle new user creation
      if (user.email && process.env.ADMIN_EMAILS?.split(',').includes(user.email)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { admin: true },
        });
      }
    }
  }
  // ... other config
}
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export default NextAuth(authOptions);