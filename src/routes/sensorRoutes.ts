import { Router } from 'express';
import { createSensor, deleteSensor, getAllSensors, getSensorOverview, updateSensor } from '../controllers/sensorController';

const router = Router();

router.post('/', createSensor);
router.get('/', getAllSensors);
router.delete('/:id', deleteSensor);
router.patch('/:id', updateSensor);
router.get('/overview', getSensorOverview);

export default router;
