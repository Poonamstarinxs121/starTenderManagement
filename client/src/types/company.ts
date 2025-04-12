export interface Company {
  id: number;
  name: string;
  address: string;
  website: string;
  gstNumber: string;
  cinNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertCompany {
  name: string;
  address: string;
  website: string;
  gstNumber: string;
  cinNumber: string;
} 