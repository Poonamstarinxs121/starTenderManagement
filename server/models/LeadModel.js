import { pool } from '../config/database.js';

class LeadModel {
  async create(leadData) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO lead (company_name, contact_person, email, phone, address, city, state, pincode, status, source, notes, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          leadData.companyName,
          leadData.contactPerson,
          leadData.email,
          leadData.phone,
          leadData.address,
          leadData.city,
          leadData.state,
          leadData.pincode,
          leadData.status,
          leadData.source,
          leadData.notes,
          leadData.assignedTo
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw new Error('Failed to create lead');
    }
  }

  async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM lead');
      return rows;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw new Error('Failed to fetch leads');
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM lead WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw new Error('Failed to fetch lead');
    }
  }

  async findByAssignedTo(userId) {
    try {
      const [rows] = await pool.execute('SELECT * FROM lead WHERE assigned_to = ?', [userId]);
      return rows;
    } catch (error) {
      console.error('Error fetching leads by assigned user:', error);
      throw new Error('Failed to fetch leads by assigned user');
    }
  }

  async update(id, leadData) {
    try {
      const [result] = await pool.execute(
        'UPDATE lead SET company_name = ?, contact_person = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ?, status = ?, source = ?, notes = ?, assigned_to = ? WHERE id = ?',
        [
          leadData.companyName,
          leadData.contactPerson,
          leadData.email,
          leadData.phone,
          leadData.address,
          leadData.city,
          leadData.state,
          leadData.pincode,
          leadData.status,
          leadData.source,
          leadData.notes,
          leadData.assignedTo,
          id
        ]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw new Error('Failed to update lead');
    }
  }

  async updateStatus(id, status) {
    try {
      const [result] = await pool.execute(
        'UPDATE lead SET status = ? WHERE id = ?',
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw new Error('Failed to update lead status');
    }
  }

  async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM lead WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw new Error('Failed to delete lead');
    }
  }

  async search(query) {
    try {
      const searchQuery = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM lead WHERE company_name LIKE ? OR contact_person LIKE ? OR email LIKE ? OR status LIKE ?',
        [searchQuery, searchQuery, searchQuery, searchQuery]
      );
      return rows;
    } catch (error) {
      console.error('Error searching leads:', error);
      throw new Error('Failed to search leads');
    }
  }

  async getLeadsByStatus(status) {
    try {
      const [rows] = await pool.execute('SELECT * FROM lead WHERE status = ?', [status]);
      return rows;
    } catch (error) {
      console.error('Error fetching leads by status:', error);
      throw new Error('Failed to fetch leads by status');
    }
  }
}

export default new LeadModel(); 