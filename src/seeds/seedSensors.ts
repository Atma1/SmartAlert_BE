import { pool } from '../models/db';

interface SensorSeed {
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    temperature?: number;
    moisture?: number;
    movement?: number;
    status?: 'Normal' | 'Siaga' | 'Bahaya';
}

const sensors: SensorSeed[] = [
    {
        name: 'Sensor-001',
        location: 'Bukit A - Zona Timur',
        latitude: -7.736771,
        longitude: 112.430257,
        temperature: 28.5,
        moisture: 65.0,
        movement: 0.5,
        status: 'Normal'
    },
    {
        name: 'Sensor-002',
        location: 'Bukit B - Zona Barat',
        latitude: -7.737000,
        longitude: 112.431000,
        temperature: 32.0,
        moisture: 45.0,
        movement: 1.2,
        status: 'Siaga'
    },
    {
        name: 'Sensor-003',
        location: 'Bukit C - Zona Selatan',
        latitude: -7.738000,
        longitude: 112.430500,
        temperature: 24.0,
        moisture: 55.0,
        movement: 0.1,
        status: 'Normal'
    },
    {
        name: 'Sensor-004',
        location: 'Bukit D - Zona Timur',
        latitude: -7.736500,
        longitude: 112.432000,
        temperature: 52.0,
        moisture: 18.0,
        movement: 6.5,
        status: 'Bahaya'
    },
    {
        name: 'Sensor-005',
        location: 'Bukit E - Zona Utara',
        latitude: -7.737500,
        longitude: 112.429500,
        temperature: 30.0,
        moisture: 60.0,
        movement: 0.8,
        status: 'Normal'
    }
];

export const seedSensors = async () => {
    console.log('Seeding sensors table...');

    for (const sensor of sensors) {
        const formatMySQLDatetime = (date: Date): string => {
            return date.toISOString().slice(0, 19).replace('T', ' ');
        };

        await pool.execute(
            `INSERT INTO sensors (name, location, latitude, longitude, temperature, moisture, movement, status, lastUpdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                sensor.name,
                sensor.location,
                sensor.latitude,
                sensor.longitude,
                sensor.temperature || 25.0,
                sensor.moisture || 60.0,
                sensor.movement || 0.0,
                sensor.status || 'Normal',
                formatMySQLDatetime(new Date())
            ]
        );
    }

    console.log('Sensors table seeded successfully');
};

if (require.main === module) {
    seedSensors()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Seeding sensors failed:', err);
            process.exit(1);
        });
}
