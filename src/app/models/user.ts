export const enum Role {
  admin = 'admin',
  seller = 'seller',
  buyer = 'buyer',
}
export interface IUser {
  id: string;
  name: string;
  role: Role;
  gender: string;
  age: number;
  dob: string;
  email: string;
  password: string;
  mobNumber: string;
  language: string[];
  agreetc: boolean;
  uploadPhoto?: string;
  aboutYou?: string;
  address?: IAddress;
}

export interface IAddress {
  addLine1: string;
  addLine2: string;
  city: string;
  state: string;
  zipCode: number;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  mobNumber: string;
  age: number;
  dob: string;
  email: string;
  password: string;
  language: string[];
  gender: string;
  aboutYou?: string | null;
  uploadPhoto?: string | null;
  agreetc: boolean;
  role: Role;
  address: {
    addLine1: string;
    city: string;
    state: string;
    zipCode: number;
    addLine2?: string | null;
  };
}
