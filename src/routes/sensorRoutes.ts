import { Router } from 'express';
import { createSensor, getAllSensors, getSensorOverview } from '../controllers/sensorController';

const router = Router();

router.post('/', createSensor);
router.get('/', getAllSensors);
router.get('/overview', getSensorOverview);

export default router;
