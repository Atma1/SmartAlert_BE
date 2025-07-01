import { Request, Response } from 'express';
import { pool } from '../models/db'; // koneksi pool mysql2/promise
import path from 'path';

export const submitReport = async (req: Request, res: Response) => {
  try {
    const { name, location, description, latitude, longitude } = req.body;
    const image = req.file;

    if (!name || !location || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const imagePath = image ? `/uploads/${image.filename}` : null;

    const [result] = await pool.execute(
      `INSERT INTO reports 
        (name, location, description, latitude, longitude, image_path, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        location,
        description,
        latitude || null,
        longitude || null,
        imagePath,
        'pending'
      ]
    );

    res.status(201).json({ message: 'Report submitted', reportId: (result as any).insertId });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateReportStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
  
    if (!['pending', 'verified', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
  
    try {
      const [result] = await pool.execute(
        `UPDATE reports SET status = ? WHERE id = ?`,
        [status, id]
      );
  
      if ((result as any).affectedRows === 0) {
        return res.status(404).json({ message: 'Report not found' });
      }
  
      res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  export const getAllReports = async (req: Request, res: Response) => {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, location, latitude, longitude, description, image_path, status, created_at FROM reports ORDER BY created_at DESC'
      );
      res.json(rows);
    } catch (error) {
      console.error('[GET /reports] Error fetching reports:', error);
      res.status(500).json({ message: 'Failed to fetch reports' });
    }
  };
  