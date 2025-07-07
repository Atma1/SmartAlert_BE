import { pool } from '../models/db';

export const dropSensorsTable = async () => {
    try {
        console.log('Dropping sensors table...');
        await pool.execute('DROP TABLE IF EXISTS sensors');
        console.log('Sensors table dropped successfully');
    } catch (error) {
        console.error('Error dropping sensors table:', error);
        throw error;
    }
};

if (require.main === module) {
    dropSensorsTable()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Dropping sensors table failed:', err);
            process.exit(1);
        });
}
