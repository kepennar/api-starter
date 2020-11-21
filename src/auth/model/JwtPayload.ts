import { User } from "@prisma/client";

export interface JwtPayload {
  email: string;
}

export interface ApiState {
  user?: User;
}
