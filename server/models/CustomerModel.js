import { pool } from '../config/database.js';

class CustomerModel {
  async create(customerData) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO customer (company_name, contact_person, email, phone, address, city, state, pincode, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          customerData.companyName,
          customerData.contactPerson,
          customerData.email,
          customerData.phone,
          customerData.address,
          customerData.city,
          customerData.state,
          customerData.pincode,
          customerData.status
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM customer');
      return rows;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM customer WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw new Error('Failed to fetch customer');
    }
  }

  async update(id, customerData) {
    try {
      const [result] = await pool.execute(
        'UPDATE customer SET company_name = ?, contact_person = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ?, status = ? WHERE id = ?',
        [
          customerData.companyName,
          customerData.contactPerson,
          customerData.email,
          customerData.phone,
          customerData.address,
          customerData.city,
          customerData.state,
          customerData.pincode,
          customerData.status,
          id
        ]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw new Error('Failed to update customer');
    }
  }

  async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM customer WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw new Error('Failed to delete customer');
    }
  }

  async search(query) {
    try {
      const searchQuery = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM customer WHERE company_name LIKE ? OR contact_person LIKE ? OR email LIKE ?',
        [searchQuery, searchQuery, searchQuery]
      );
      return rows;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw new Error('Failed to search customers');
    }
  }
}

export default new CustomerModel(); 