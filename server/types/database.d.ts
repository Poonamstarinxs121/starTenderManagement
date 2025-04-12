import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface DatabaseError extends Error {
  code?: string;
  errno?: number;
  sqlMessage?: string;
  sqlState?: string;
}

export interface QueryResult extends RowDataPacket {
  insertId?: number;
  affectedRows?: number;
}

export interface Role extends RowDataPacket {
  id: number;
  role: string;
  role_description: string;
  permission: string;
  created_at: Date;
  updated_at: Date;
}

// Add more table interfaces as needed 