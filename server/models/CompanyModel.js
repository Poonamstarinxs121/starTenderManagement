import { pool } from '../config/database.js';

class CompanyModel {
  async create(companyData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO companies (
          company_name, 
          address, 
          website, 
          gst_number, 
          cin_number, 
          contact_person,
          email,
          phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyData.name,
          companyData.address,
          companyData.website,
          companyData.gst_number,
          companyData.cin_number,
          companyData.contact_person,
          companyData.email,
          companyData.phone
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating company:', error);
      throw new Error('Failed to create company: ' + error.message);
    }
  }

  async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM companies');
      return rows;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw new Error('Failed to fetch companies');
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM companies WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw new Error('Failed to fetch company');
    }
  }

  async update(id, companyData) {
    try {
      const [result] = await pool.execute(
        `UPDATE companies SET 
          company_name = ?, 
          address = ?, 
          website = ?, 
          gst_number = ?, 
          cin_number = ?, 
          contact_person = ?,
          email = ?,
          phone = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          companyData.name,
          companyData.address,
          companyData.website,
          companyData.gst_number,
          companyData.cin_number,
          companyData.contact_person,
          companyData.email,
          companyData.phone,
          id
        ]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating company:', error);
      throw new Error('Failed to update company');
    }
  }

  async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM companies WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw new Error('Failed to delete company');
    }
  }

  async search(query) {
    try {
      const searchPattern = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM company WHERE name LIKE ? OR gst_number LIKE ? OR cin_number LIKE ?',
        [searchPattern, searchPattern, searchPattern]
      );
      return rows.map(this.mapToCompanyDTO);
    } catch (error) {
      console.error('Error searching companies:', error);
      throw new Error('Failed to search companies');
    }
  }

  mapToCompanyDTO(row) {
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      website: row.website,
      gstNumber: row.gst_number,
      cinNumber: row.cin_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default new CompanyModel(); 