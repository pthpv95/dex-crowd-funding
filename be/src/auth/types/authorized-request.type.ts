import { Request } from 'express';
import { User } from '../../users/user.entity';

export interface AuthorizedRequest extends Request {
  user: User;
}
