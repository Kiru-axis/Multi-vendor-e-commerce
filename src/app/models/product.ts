import { IUser } from './user';

export const enum Status {
  publish = 'publish',
  draft = 'draft',
  inactive = 'inactive',
}
export interface IProduct {
  id: string;
  name: string;
  uploadPhoto: string;
  productDesc: string;
  mrp: number;
  dp: number;
  status: Status;
  sellerId: string;
}
