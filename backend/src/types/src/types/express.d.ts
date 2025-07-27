// src/types/express.d.ts
import { User } from './';   // or whatever your user type is

declare global {
  namespace Express {
    interface Request {
      user?: User;   // or `user: User` if you always set it
    }
  }
}