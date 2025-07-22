import jwt, { SignOptions } from 'jsonwebtoken';
import {
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN
} from '../config/env';
import { TokenPayload } from '../types';

export const signAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as unknown as SignOptions['expiresIn']
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const signRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as unknown as SignOptions['expiresIn']
  };
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
};
