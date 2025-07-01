import express from 'express';
import { getAllEducation, createEducation, updateEducation, deleteEducation } from '../controllers/educationController';

const router = express.Router();

router.get('/', getAllEducation);
router.post('/', createEducation);
router.patch('/:id', updateEducation);
router.delete('/:id', deleteEducation);

export default router;
