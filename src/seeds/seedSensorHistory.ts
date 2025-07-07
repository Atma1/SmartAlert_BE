import { pool } from '../models/db';

interface SensorHistorySeed {
    sensor_id: number;
    recorded_at: string;
    temperature: number;
    moisture: number;
    movement: number;
    status: 'Normal' | 'Siaga' | 'Bahaya';
}

// Function to determine status based on sensor values
const determineStatus = (temp: number, moisture: number, movement: number): 'Normal' | 'Siaga' | 'Bahaya' => {
    if (temp >= 50 || moisture <= 20 || movement >= 5) {
        return 'Bahaya';
    } else if (temp >= 35 || moisture <= 40 || movement >= 2) {
        return 'Siaga';
    } else {
        return 'Normal';
    }
};

// Function to generate random sensor data
const generateRandomSensorData = (): { temperature: number, moisture: number, movement: number } => {
    const temperature = Math.random() * 40 + 15; // 15-55°C
    const moisture = Math.random() * 80 + 10; // 10-90%
    const movement = Math.random() * 8; // 0-8

    return {
        temperature: Math.round(temperature * 100) / 100,
        moisture: Math.round(moisture * 100) / 100,
        movement: Math.round(movement * 100) / 100
    };
};

// Generate 50 sensor history records
const generateSensorHistory = (): SensorHistorySeed[] => {
    const sensorHistory: SensorHistorySeed[] = [];
    const sensorIds = [1, 2, 3, 4, 5]; // Updated to 5 sensors

    for (let i = 0; i < 50; i++) {
        const now = new Date();
        const hoursBack = Math.floor(Math.random() * 72); // Random time within last 3 days
        const recordedAt = new Date(now.getTime() - (hoursBack * 60 * 60 * 1000));

        const sensorId = sensorIds[Math.floor(Math.random() * sensorIds.length)];
        const { temperature, moisture, movement } = generateRandomSensorData();
        const status = determineStatus(temperature, moisture, movement);

        sensorHistory.push({
            sensor_id: sensorId,
            recorded_at: recordedAt.toISOString().slice(0, 19).replace('T', ' '),
            temperature,
            moisture,
            movement,
            status
        });
    }

    // Sort by recorded_at descending
    return sensorHistory.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
};

export const seedSensorHistory = async () => {
    console.log('Seeding sensor_history table...');

    const sensorHistoryData = generateSensorHistory();

    for (const record of sensorHistoryData) {
        await pool.execute(
            `INSERT INTO sensor_history (sensor_id, timestamp, temperature, moisture, movement, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                record.sensor_id,
                record.recorded_at,
                record.temperature,
                record.moisture,
                record.movement,
                record.status
            ]
        );
    }

    console.log(`Sensor history table seeded successfully with ${sensorHistoryData.length} records`);
};

if (require.main === module) {
    seedSensorHistory()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Seeding sensor history failed:', err);
            process.exit(1);
        });
}
