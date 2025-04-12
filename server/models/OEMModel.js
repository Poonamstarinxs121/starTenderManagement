import { pool } from '../config/database.js';

class OEMModel {
  constructor() {
    this.pool = pool;
  }

  async create(oemData) {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO oem (vendor_id, contact_person_name, phone_no, email, address, city, state, pin_code, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          oemData.vendorId,
          oemData.contactPerson,
          oemData.phone,
          oemData.email,
          oemData.address,
          oemData.city,
          oemData.state,
          oemData.pinCode,
          oemData.status
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating OEM:', error);
      throw new Error('Failed to create OEM');
    }
  }

  async findAll() {
    try {
      const [rows] = await this.pool.execute('SELECT * FROM oem');
      return rows;
    } catch (error) {
      console.error('Error fetching OEMs:', error);
      throw new Error('Failed to fetch OEMs');
    }
  }

  async findById(id) {
    try {
      const [rows] = await this.pool.execute('SELECT * FROM oem WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error fetching OEM:', error);
      throw new Error('Failed to fetch OEM');
    }
  }

  async findByVendorId(vendorId) {
    try {
      const [rows] = await this.pool.execute('SELECT * FROM oems WHERE vendor_id = ?', [vendorId]);
      return rows[0];
    } catch (error) {
      console.error('Error fetching OEM by vendor ID:', error);
      throw new Error('Failed to fetch OEM by vendor ID');
    }
  }

  async update(id, oemData) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE oem SET vendor_id = ?, contact_person_name = ?, phone_no = ?, email = ?, address = ?, city = ?, state = ?, pin_code = ?, status = ? WHERE id = ?',
        [
          oemData.vendorId,
          oemData.contactPerson,
          oemData.phone,
          oemData.email,
          oemData.address,
          oemData.city,
          oemData.state,
          oemData.pinCode,
          oemData.status,
          id
        ]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating OEM:', error);
      throw new Error('Failed to update OEM');
    }
  }

  async delete(id) {
    try {
      const [result] = await this.pool.execute('DELETE FROM oem WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting OEM:', error);
      throw new Error('Failed to delete OEM');
    }
  }

  async search(query) {
    try {
      const searchQuery = `%${query}%`;
      const [rows] = await this.pool.execute(
        'SELECT * FROM oem WHERE contact_person_name LIKE ? OR email LIKE ?',
        [searchQuery, searchQuery]
      );
      return rows;
    } catch (error) {
      console.error('Error searching OEMs:', error);
      throw new Error('Failed to search OEMs');
    }
  }
}

export default new OEMModel(); 