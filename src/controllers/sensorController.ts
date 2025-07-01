import { Request, Response } from 'express';
import { pool } from '../models/db';

function determineStatus(temp: number, moisture: number, movement: number): 'Normal' | 'Siaga' | 'Bahaya' {
  if (temp >= 50 || moisture <= 20 || movement >= 5) {
    return 'Bahaya';
  } else if (temp >= 35 || moisture <= 40 || movement >= 2) {
    return 'Siaga';
  } else {
    return 'Normal';
  }
}

export const createSensor = async (req: Request, res: Response) => {
  
  const {
    name,
    location,
    latitude,
    longitude,
    temperature,
    moisture,
    movement
  } = req.body;
  // console.log('request body:', req.body);
  if (!name || !location || latitude == null || longitude == null) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  // Validasi nilai latitude dan longitude
  const lat = parseFloat(latitude);
  const long = parseFloat(longitude);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    return res.status(400).json({ message: 'Latitude must be a number between -90 and 90.' });
  }

  if (isNaN(long) || long < -180 || long > 180) {
    return res.status(400).json({ message: 'Longitude must be a number between -180 and 180.' });
  }

  function formatMySQLDatetime(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
  
  try {
    const temp = parseFloat(temperature) || 25;
    const moist = parseFloat(moisture) || 60;
    const move = parseFloat(movement) || 0;

    const status = determineStatus(temp, moist, move);

    const [result] = await pool.execute(
      `INSERT INTO sensors 
        (name, location, latitude, longitude, temperature, moisture, movement, status, lastUpdate) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        location,
        lat,
        long,
        temp,
        moist,
        move,
        status,
        formatMySQLDatetime(new Date())

      ]
    );

    return res.status(201).json({ message: 'Sensor saved successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to save sensor' });
  }
};

export const getAllSensors = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('Select * FROM sensors ORDER BY lastUpdate Desc');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Get sensors error:', error);
    return res.status(500).json({message: 'Failed to fetch sensors'});
  }
};

export const getSensorOverview = async (_req: Request, res: Response) => {
  try {
      const [rows] = await pool.query(`
          SELECT 
          COUNT(*) AS totalSensors,
          AVG(temperature) AS avgTemperature,
          AVG(moisture) AS avgMoisture,
          SUM(CASE WHEN status ='Bahaya' THEN 1 ELSE 0 END) AS criticalAlerts
          FROM sensors
         `);
      const result = rows [0];
      res.status(200).json({
          totalSensors: result.totalSensors,
          avgTemperature: parseFloat(result.avgTemperature).toFixed(1),
          avgMoisture: parseFloat(result.avgMoisture).toFixed(1),
          criticalAlerts: result.criticalAlerts
      });
  } catch (error) {
      console.error('Error fetching sensor overciew:', error);
      res.status(500).json({message: 'Error fetching overview', error});
  }
};
