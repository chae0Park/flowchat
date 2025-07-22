import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN as string;

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("Missing JWT secrets in environment variables.");
}