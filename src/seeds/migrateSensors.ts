import { pool } from '../models/db';

export const migrateSensorsTable = async () => {
    try {
        console.log('Creating sensors table...');

        await pool.execute(`
      CREATE TABLE IF NOT EXISTS sensors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        temperature DECIMAL(5, 2) DEFAULT 25.00,
        moisture DECIMAL(5, 2) DEFAULT 60.00,
        movement DECIMAL(5, 2) DEFAULT 0.00,
        status ENUM('Normal', 'Siaga', 'Bahaya') DEFAULT 'Normal',
        lastUpdate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        // Create indexes
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_sensors_status ON sensors(status)');
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_sensors_last_update ON sensors(lastUpdate)');
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_sensors_location ON sensors(location)');
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_sensors_coordinates ON sensors(latitude, longitude)');
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_sensors_name ON sensors(name)');

        console.log('Sensors table created successfully');
    } catch (error) {
        console.error('Error creating sensors table:', error);
        throw error;
    }
};

if (require.main === module) {
    migrateSensorsTable()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Sensors table migration failed:', err);
            process.exit(1);
        });
}
