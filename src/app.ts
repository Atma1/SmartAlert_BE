import express from 'express';
import cors from 'cors';
import sensorRoutes from './routes/sensorRoutes';
import sensorHistoryRoutes from './routes/sensorHistoryRoutes';
import reportRoutes from './routes/reportRoutes';
import educationRoutes from './routes/educationRoutes';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use('/api/sensors', sensorRoutes);
app.use('/api/sensor-history', sensorHistoryRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/education', educationRoutes);

export default app;
