import { pool } from '../models/db';

interface Education {
    title: string;
    summary: string;
    content: string;
    imageUrl: string;
    category: string;
    tags: string[];
}

const educations: Education[] = [
    {
        title: 'Introduction to Sensors',
        summary: 'Summary',
        imageUrl: 'https://picsum.photos/400',
        content: 'Basic overview of IoT sensors, their types and uses.',
        category: 'Awareness',
        tags: ['temperature', 'moisture', 'movement']
    },
    {
        title: 'Advanced Data Analysis',
        summary: 'Summary',
        content: 'Analyzing sensor data using statistical methods.',
        category: 'Safety',
        imageUrl: 'https://picsum.photos/400',
        tags: ['averages', 'trends', 'anomalies']
    },
    {
        title: 'Alerts and Notifications',
        summary: 'Summary',
        imageUrl: 'https://picsum.photos/400',
        content: 'Implementing real-time alerts based on sensor thresholds.',
        category: 'Prevention',
        tags: ['thresholds', 'status', 'notifications']
    }
];

export const seedEducation = async () => {
    console.log('Seeding education table...');
    for (const edu of educations) {
        await pool.execute(
            'INSERT INTO education (title, content, summary, category, image_url, tags) VALUES (?, ?, ?, ?, ?, ?)',
            [edu.title, edu.content, edu.summary, edu.category, edu.imageUrl, JSON.stringify(edu.tags)]
        );
    }
    console.log('Education table seeded successfully');
};

// Run seeder when executed directly
if (require.main === module) {
    seedEducation()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Seeding education failed:', err);
            process.exit(1);
        });
}
