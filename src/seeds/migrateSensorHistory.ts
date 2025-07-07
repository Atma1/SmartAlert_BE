import { pool } from '../models/db';

export const migrateSensorHistoryTable = async () => {
    try {
        console.log('Creating sensor_history table...');

        await pool.execute(`
      CREATE TABLE IF NOT EXISTS sensor_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sensor_id INT NOT NULL,
        timestamp DATETIME NOT NULL,
        temperature DECIMAL(5, 2) NOT NULL,
        moisture DECIMAL(5, 2) NOT NULL,
        movement DECIMAL(5, 2) NOT NULL,
        status ENUM('Normal', 'Siaga', 'Bahaya') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE
      )
    `);

        // Create indexes
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_sensor_history_sensor_id ON sensor_history(sensor_id)');
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_sensor_history_recorded_at ON sensor_history(timestamp)');
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_sensor_history_status ON sensor_history(status)');
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_sensor_history_sensor_recorded ON sensor_history(sensor_id, timestamp)');
        await pool.execute('CREATE INDEX IF NOT EXISTS idx_sensor_history_latest ON sensor_history(sensor_id, timestamp DESC)');

        console.log('Sensor history table created successfully');
    } catch (error) {
        console.error('Error creating sensor_history table:', error);
        throw error;
    }
};

if (require.main === module) {
    migrateSensorHistoryTable()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Sensor history table migration failed:', err);
            process.exit(1);
        });
}
