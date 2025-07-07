import { pool } from '../models/db';

interface ReportSeed {
    name: string;
    location: string;
    description: string;
    latitude?: number;
    longitude?: number;
    image_path?: string;
    status?: 'pending' | 'verified' | 'resolved';
}

const reports: ReportSeed[] = [
    {
        name: 'Budi Suwardo',
        location: 'Warehouse A',
        description: 'Temperature sensor not responding.',
        latitude: -6.200000,
        longitude: 106.816666,
        image_path: 'https://picsum.photos/400',
        status: 'pending'
    },
    {
        name: 'John',
        location: 'Server Room',
        description: 'Sudden moisture increase detected.',
        latitude: -6.210000,
        longitude: 106.820000,
        image_path: 'https://picsum.photos/400',
        status: 'verified'
    },
    {
        name: 'Jane',
        location: 'Gate 3',
        description: 'Movement detected outside scheduled time.',
        latitude: -6.215000,
        longitude: 106.822000,
        image_path: 'https://picsum.photos/400',
        status: 'resolved'
    }
];

export const seedReports = async () => {
    console.log('Seeding reports table...');
    for (const rpt of reports) {
        await pool.execute(
            `INSERT INTO reports (name, location, description, latitude, longitude, image_path, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [rpt.name, rpt.location, rpt.description, rpt.latitude || null, rpt.longitude || null, rpt.image_path || null, rpt.status || 'pending']
        );
    }
    console.log('Reports table seeded successfully');
};

if (require.main === module) {
    seedReports()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Seeding reports failed:', err);
            process.exit(1);
        });
}
