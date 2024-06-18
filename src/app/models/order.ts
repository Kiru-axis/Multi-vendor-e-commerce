import { IProduct } from './product';
import { IAddress } from './user';

export const enum OrderStatus {
  pending = 'pending',
  rejected = 'rejected',
  processed = 'processed',
}

export interface IOrder {
  id: string;
  userId: string;
  sellerId: string;
  product: IProduct;
  deliveryAddress: IAddress;
  contact: string;
  createdAt: string;
  productId: string;
  status: OrderStatus;
}

export interface ICreateOrder {
  productId: string;
  userId: string;
  deliveryAddress: IAddress;
  product: IProduct; //normaly selected as join from real db
  contact?: string;
  createdAt?: string;
}
