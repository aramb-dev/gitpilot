import { z } from 'zod';

const envSchema = z.object({
  // Authentication
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(1),

  // GitHub OAuth
  GITHUB_ID: z.string().min(1),
  GITHUB_SECRET: z.string().min(1),

  // Database
  DATABASE_URL: z.string().url(),

  // Optional / Deployment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  E2E_MODE: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
