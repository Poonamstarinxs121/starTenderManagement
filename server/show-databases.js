import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function showDatabases() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    // Show all databases
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('\nAvailable Databases:');
    console.log('-------------------');
    databases.forEach(db => {
      console.log(db.Database);
    });

    // Show tables in your specific database
    await connection.query(`USE ${process.env.DB_NAME}`);
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\nTables in ${process.env.DB_NAME}:`);
    console.log('-------------------');
    tables.forEach(table => {
      console.log(Object.values(table)[0]);
    });

    // Show table structures
    console.log('\nTable Structures:');
    console.log('----------------');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      console.log(`\n${tableName}:`);
      columns.forEach(column => {
        console.log(`  ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : ''} ${column.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

showDatabases(); 