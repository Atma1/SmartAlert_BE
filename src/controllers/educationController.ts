import { Request, Response } from 'express';
import {pool} from '../models/db'; // pastikan koneksi mysql2/promise

export const getAllEducation = async (_: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM education ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch education data' });
  }
};

export const createEducation = async (req: Request, res: Response) => {
  const { title, description, topics } = req.body;

  if (!title || !description || !Array.isArray(topics)) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO education (title, description, topics) VALUES (?, ?, ?)',
      [title, description, JSON.stringify(topics)]
    );
    res.status(201).json({ message: 'Education created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create education' });
  }
};

export const updateEducation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, topics } = req.body;

  if (!title || !description || !Array.isArray(topics)) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE education SET title = ?, description = ?, topics = ? WHERE id = ?',
      [title, description, JSON.stringify(topics), id]
    );
    res.json({ message: 'Education updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update education' });
  }
};

export const deleteEducation = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM education WHERE id = ?', [id]);
    res.json({ message: 'Education deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete education' });
  }
};
