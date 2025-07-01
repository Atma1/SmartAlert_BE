import express from 'express';
import multer from 'multer';
import path from 'path';
import { getAllReports, submitReport, updateReportStatus } from '../controllers/reportController';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

router.post('/submit', upload.single('image'), submitReport);
router.patch('/:id/status', updateReportStatus);
router.get('/', getAllReports);

export default router;
