import { pool } from '../config/database.js';

class UserModel {
  async create(userData) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (full_name, email, phoneno, password, role, department, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          userData.fullName,
          userData.email,
          userData.phoneno,
          userData.password,
          userData.role,
          userData.department,
          userData.status
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async findAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM users');
      return rows;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async findByEmail(email) {
    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new Error('Failed to fetch user by email');
    }
  }

  async update(id, userData) {
    try {
      const [result] = await pool.execute(
        'UPDATE users SET full_name = ?, email = ?, phoneno = ?, role = ?, department = ?, status = ? WHERE id = ?',
        [
          userData.fullName,
          userData.email,
          userData.phoneno,
          userData.role,
          userData.department,
          userData.status,
          id
        ]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }
}

export default new UserModel(); 