const requiredEnv = ['DATABASE_URL', 'ANTHROPIC_API_KEY'] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10),
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES ?? '.xlsx,.xls').split(','),
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
};
