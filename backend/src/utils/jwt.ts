import jwt from 'jsonwebtoken';
import { TokenPayload } from '../modules/auth/auth.types';

export const generateToken = (user: any): string => {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    sessionId: new Date().getTime().toString(),
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '24h'
  });
}; 