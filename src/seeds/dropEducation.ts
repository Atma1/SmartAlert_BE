import { pool } from '../models/db';

export const dropEducationTable = async () => {
    try {
        console.log('Dropping education table...');
        await pool.execute('DROP TABLE IF EXISTS education');
        console.log('Education table dropped successfully');
    } catch (error) {
        console.error('Error dropping education table:', error);
        throw error;
    }
};

if (require.main === module) {
    dropEducationTable()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Dropping education table failed:', err);
            process.exit(1);
        });
}
