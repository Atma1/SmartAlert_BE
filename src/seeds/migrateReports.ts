import { pool } from '../models/db';

export const migrateReportsTable = async () => {
    try {
        console.log('Creating reports table...');

        await pool.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        latitude DECIMAL(10, 8) NULL,
        longitude DECIMAL(11, 8) NULL,
        image_path VARCHAR(500) NULL,
        status ENUM('pending', 'verified', 'resolved') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        // Create indexes
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)');
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at)');
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(location)');
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_reports_coordinates ON reports(latitude, longitude)');

        console.log('Reports table created successfully');
    } catch (error) {
        console.error('Error creating reports table:', error);
        throw error;
    }
};

if (require.main === module) {
    migrateReportsTable()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Reports table migration failed:', err);
            process.exit(1);
        });
}
