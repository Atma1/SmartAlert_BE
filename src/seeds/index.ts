import { pool } from '../models/db';
import { seedEducation } from './seedEducation';
import { seedReports } from './seedReports';
import { seedSensors } from './seedSensors';
import { seedSensorHistory } from './seedSensorHistory';
import { dropEducationTable } from './dropEducation';
import { dropReportsTable } from './dropReports';
import { dropSensorsTable } from './dropSensors';
import { dropSensorHistoryTable } from './dropSensorHistory';
import { migrateEducationTable } from './migrateEducation';
import { migrateReportsTable } from './migrateReports';
import { migrateSensorsTable } from './migrateSensors';
import { migrateSensorHistoryTable } from './migrateSensorHistory';

export const runAllSeeders = async (closePool: boolean = true) => {
    try {
        console.log('Starting database seeding...');

        // Seed tables in dependency order
        await seedEducation();
        await seedReports();
        await seedSensors();
        await seedSensorHistory(); // Must run after sensors due to foreign key constraint

        console.log('All tables seeded successfully!');
    } catch (error) {
        console.error('Seeding failed:', error);
        throw error;
    } finally {
        if (closePool) {
            await pool.end();
        }
    }
};

export const dropAllTables = async () => {
    try {
        console.log('Starting to drop all tables...');

        // Drop tables in reverse dependency order (child tables first)
        await dropSensorHistoryTable(); // Drop first due to foreign key constraint
        await dropSensorsTable();
        await dropReportsTable();
        await dropEducationTable();

        console.log('All tables dropped successfully!');
    } catch (error) {
        console.error('Dropping tables failed:', error);
        throw error;
    }
};

export const resetDatabase = async () => {
    try {
        console.log('Starting database reset...');

        // Drop all tables first
        await dropAllTables();

        // Migrate tables (create schema)
        await migrateAllTables();

        // Then seed all tables
        await runAllSeeders(false);

        console.log('Database reset completed successfully!');
    } catch (error) {
        console.error('Database reset failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
};

export const migrateAllTables = async () => {
    try {
        console.log('Starting database migration...');

        // Migrate tables in dependency order
        await migrateEducationTable();
        await migrateReportsTable();
        await migrateSensorsTable();
        await migrateSensorHistoryTable(); // Must run after sensors due to foreign key constraint

        console.log('All tables migrated successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

// Run all seeders when executed directly
if (require.main === module) {
    runAllSeeders()
        .then(() => {
            console.log('Database seeding completed successfully');
            process.exit(0);
        })
        .catch(err => {
            console.error('Database seeding failed:', err);
            process.exit(1);
        });
}
