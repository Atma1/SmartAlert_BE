import { pool } from '../models/db';

export const dropSensorHistoryTable = async () => {
    try {
        console.log('Dropping sensor_history table...');
        await pool.execute('DROP TABLE IF EXISTS sensor_history');
        console.log('Sensor history table dropped successfully');
    } catch (error) {
        console.error('Error dropping sensor_history table:', error);
        throw error;
    }
};

if (require.main === module) {
    dropSensorHistoryTable()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Dropping sensor_history table failed:', err);
            process.exit(1);
        });
}
