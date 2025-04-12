import { RowDataPacket, ResultSetHeader, Pool } from 'mysql2/promise';
import pool from '../config/database';

export interface OEM extends RowDataPacket {
  id: number;
  vendorId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOEMInput {
  vendorId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  status: 'active' | 'inactive';
}

class OEMModel {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // Create a new OEM
  async create(data: CreateOEMInput): Promise<OEM> {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `INSERT INTO oems (
          vendorId, companyName, contactPerson, phone, email, 
          address, city, state, pinCode, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.vendorId,
          data.companyName,
          data.contactPerson,
          data.phone,
          data.email,
          data.address,
          data.city,
          data.state,
          data.pinCode,
          data.status
        ]
      );

      const [newOEM] = await this.pool.query<OEM[]>(
        'SELECT * FROM oems WHERE id = ?',
        [result.insertId]
      );

      return newOEM[0];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create OEM: ${error.message}`);
      }
      throw error;
    }
  }

  // Get all OEMs
  async findAll(): Promise<OEM[]> {
    try {
      const [oems] = await this.pool.query<OEM[]>('SELECT * FROM oems');
      return oems;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch OEMs: ${error.message}`);
      }
      throw error;
    }
  }

  // Get OEM by ID
  async findById(id: number): Promise<OEM | null> {
    try {
      const [oems] = await this.pool.query<OEM[]>(
        'SELECT * FROM oems WHERE id = ?',
        [id]
      );
      return oems[0] || null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch OEM by ID: ${error.message}`);
      }
      throw error;
    }
  }

  // Update OEM
  async update(id: number, data: Partial<CreateOEMInput>): Promise<OEM | null> {
    try {
      const entries = Object.entries(data);
      if (entries.length === 0) return null;

      const updates = entries.map(([key]) => `${key} = ?`).join(', ');
      const values = entries.map(([, value]) => value);

      await this.pool.query(
        `UPDATE oems SET ${updates} WHERE id = ?`,
        [...values, id]
      );

      return this.findById(id);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update OEM: ${error.message}`);
      }
      throw error;
    }
  }

  // Delete OEM
  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        'DELETE FROM oems WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete OEM: ${error.message}`);
      }
      throw error;
    }
  }

  // Find OEM by vendor ID
  async findByVendorId(vendorId: string): Promise<OEM | null> {
    const [oems] = await this.pool.query<OEM[]>(
      'SELECT * FROM oems WHERE vendorId = ?',
      [vendorId]
    );
    return oems[0] || null;
  }

  // Search OEMs
  async search(query: string): Promise<OEM[]> {
    try {
      const searchPattern = `%${query}%`;
      const [oems] = await this.pool.query<OEM[]>(
        `SELECT * FROM oems 
         WHERE companyName LIKE ? 
         OR vendorId LIKE ? 
         OR contactPerson LIKE ?
         OR city LIKE ?
         OR state LIKE ?`,
        [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
      );
      return oems;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search OEMs: ${error.message}`);
      }
      throw error;
    }
  }
}

export default new OEMModel(); 