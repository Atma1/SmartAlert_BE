import express from 'express';
import {
  getSensorHistorySummary,
  getSensorPerformance,
  getStatusDistribution,
  createSensorLog,
  getSensorOverview,
  exportSensorTrendCsv
} from '../controllers/sensorHistoryController';

const router = express.Router();

router.get('/summary', getSensorHistorySummary);
router.get('/performance', getSensorPerformance);
router.get('/status-distribution', getStatusDistribution);
router.post('/', createSensorLog);
router.get('/export', exportSensorTrendCsv);

export default router;
