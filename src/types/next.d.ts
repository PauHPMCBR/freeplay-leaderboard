import type { Session } from "next-auth"

declare module "next" {
  interface NextApiRequest {
    files?: Record<string, formidable.File[]>
  }
}

declare module "next-auth" {
  interface Session {
    user?: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}