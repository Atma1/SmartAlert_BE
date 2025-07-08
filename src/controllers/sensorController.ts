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
    // Get all sensors
    const [sensors] = await pool.query('SELECT * FROM sensors ORDER BY lastUpdate DESC') as any[];

    // Get sensor history for each sensor
    const sensorsWithHistory = await Promise.all(
      sensors.map(async (sensor: any) => {
        const [history] = await pool.query(
          'SELECT * FROM sensor_history WHERE sensor_id = ? ORDER BY timestamp DESC',
          [sensor.id]
        ) as any[];

        return {
          ...sensor,
          temperature: parseFloat(sensor.temperature),
          moisture: parseFloat(sensor.moisture),
          movement: parseFloat(sensor.movement),
          history: history
        };
      })
    );

    return res.status(200).json(sensorsWithHistory);
  } catch (error) {
    console.error('Get sensors error:', error);
    return res.status(500).json({ message: 'Failed to fetch sensors' });
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
         `) as any[];
    const result = rows[0];
    res.status(200).json({
      totalSensors: result.totalSensors,
      avgTemperature: parseFloat(result.avgTemperature).toFixed(1),
      avgMoisture: parseFloat(result.avgMoisture).toFixed(1),
      criticalAlerts: result.criticalAlerts
    });
  } catch (error) {
    console.error('Error fetching sensor overciew:', error);
    res.status(500).json({ message: 'Error fetching overview', error });
  }
};

export const deleteSensor = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'Sensor ID is required.' });
  }
  try {
    // Optionally, delete related sensor_history first if you want to enforce referential integrity
    await pool.query('DELETE FROM sensor_history WHERE sensor_id = ?', [id]);
    const [result]: any = await pool.query('DELETE FROM sensors WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sensor not found.' });
    }
    return res.status(200).json({ message: 'Sensor deleted successfully.' });
  } catch (error) {
    console.error('Delete sensor error:', error);
    return res.status(500).json({ message: 'Failed to delete sensor.' });
  }
};

export const updateSensor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    location,
    latitude,
    longitude,
    temperature,
    moisture,
    movement
  } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Sensor ID is required.' });
  }

  // Validate latitude and longitude if provided
  let lat, long;
  if (latitude !== undefined) {
    lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ message: 'Latitude must be a number between -90 and 90.' });
    }
  }
  if (longitude !== undefined) {
    long = parseFloat(longitude);
    if (isNaN(long) || long < -180 || long > 180) {
      return res.status(400).json({ message: 'Longitude must be a number between -180 and 180.' });
    }
  }

  try {
    // Fetch current sensor to get old values if not provided in update
    const [sensors]: any = await pool.query('SELECT * FROM sensors WHERE id = ?', [id]);
    if (sensors.length === 0) {
      return res.status(404).json({ message: 'Sensor not found.' });
    }
    const current = sensors[0];

    const temp = temperature !== undefined ? parseFloat(temperature) : parseFloat(current.temperature);
    const moist = moisture !== undefined ? parseFloat(moisture) : parseFloat(current.moisture);
    const move = movement !== undefined ? parseFloat(movement) : parseFloat(current.movement);

    const status = determineStatus(temp, moist, move);

    await pool.query(
      `UPDATE sensors SET 
        name = ?, 
        location = ?, 
        latitude = ?, 
        longitude = ?, 
        temperature = ?, 
        moisture = ?, 
        movement = ?, 
        status = ?, 
        lastUpdate = NOW()
      WHERE id = ?`,
      [
        name !== undefined ? name : current.name,
        location !== undefined ? location : current.location,
        lat !== undefined ? lat : current.latitude,
        long !== undefined ? long : current.longitude,
        temp,
        moist,
        move,
        status,
        id
      ]
    );

    return res.status(200).json({ message: 'Sensor updated successfully.' });
  } catch (error) {
    console.error('Update sensor error:', error);
    return res.status(500).json({ message: 'Failed to update sensor.' });
  }
};