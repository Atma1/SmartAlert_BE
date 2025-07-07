import { pool } from '../models/db';

export const migrateEducationTable = async () => {
    try {
        console.log('Creating education table...');

        await pool.execute(`
      CREATE TABLE IF NOT EXISTS education (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        summary TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT NOT NULL,
        tags JSON NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        // Create indexes
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_education_created_at ON education(createdAt)');
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_education_title ON education(title)');

        console.log('Education table created successfully');
    } catch (error) {
        console.error('Error creating education table:', error);
        throw error;
    }
};

if (require.main === module) {
    migrateEducationTable()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Education table migration failed:', err);
            process.exit(1);
        });
}
