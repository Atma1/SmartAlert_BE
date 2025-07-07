import { pool } from '../models/db';

export const dropReportsTable = async () => {
    try {
        console.log('Dropping reports table...');
        await pool.execute('DROP TABLE IF EXISTS reports');
        console.log('Reports table dropped successfully');
    } catch (error) {
        console.error('Error dropping reports table:', error);
        throw error;
    }
};

if (require.main === module) {
    dropReportsTable()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Dropping reports table failed:', err);
            process.exit(1);
        });
}
