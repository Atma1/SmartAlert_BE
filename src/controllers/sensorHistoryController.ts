import { Request, Response } from 'express';
import { pool } from '../models/db';
import { Parser } from 'json2csv';

export const getSensorHistorySummary = async (req: Request, res: Response) => {
    const { range } = req.query;
    let days = 7;
    if (range === '24h') days = 1;
    else if (range === '30d') days = 30;
    else if (range === '90d') days = 90;

    try {
        const [rows] =  await pool.execute(
            `SELECT DATE(recorded_at) AS date,
                    AVG(temperature) AS avgTemperature,
                    AVG(moisture) AS avgMoisture,
                    AVG(movement) AS avgMovement
            FROM sensor_history
            WHERE recorded_at >= CURDATE() - INTERVAL ? DAY
            GROUP BY date
            ORDER BY date`,
            [days]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching sensor history:', error);
        res.status(500).json({ message: 'Failed to fetch sensor history' });
    }
};

export const getSensorPerformance = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.execute(
            `SELECT s.id, s.name, s.location, sh.temperature, sh.moisture, sh.movement,
                CASE sh.status
                    WHEN 'Normal' THEN 100 - sh.movement * 10 + 20
                    WHEN 'Siaga' THEN 100 - sh.movement * 10 + 10
                    ELSE 100 - sh.movement * 10
                END AS score
        FROM sensors s
        JOIN (
            SELECT sensor_id, MAX(recorded_at) as latest
            FROM sensor_history
            GROUP BY sensor_id
        ) latest_sh ON latest_sh.sensor_id = s.id
        JOIN sensor_history sh ON sh.sensor_id = latest_sh.sensor_id AND sh.recorded_at = latest_sh.latest`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching sensor performance:', error);
        res.status(500).json({ message: 'Failed to fetch sensor performance' });
    }
};

export const getStatusDistribution = async (_req: Request, res: Response) => {
    try {
      const [rows] = await pool.execute(
        `SELECT status, COUNT(*) as count
         FROM sensors
         GROUP BY status`
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching status distribution', error: err });
    }
  };

  function determineStatus(temp: number, moisture: number, movement: number): 'Normal' | 'Siaga' | 'Bahaya' {
    if (temp >= 50 || moisture <= 20 || movement >= 5) {
      return 'Bahaya';
    } else if (temp >= 35 || moisture <= 40 || movement >= 2) {
      return 'Siaga';
    } else {
      return 'Normal';
    }
  }

  export const createSensorLog = async (req: Request, res: Response) => {
    const { sensor_id, recorded_at, temperature, moisture, movement } = req.body;
    console.log("request body:", req.body);
    if (sensor_id == null || recorded_at == null || temperature === undefined || moisture === undefined || movement === undefined ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
        const temp = parseFloat(temperature) || 25;
        const moist = parseFloat(moisture) || 60;
        const move = parseFloat(movement) || 0;
    
        const status = determineStatus(temp, moist, move);
        const formattedTime = new Date(recorded_at).toISOString().slice(0, 19).replace('T', ' ');

      await pool.execute(
        `INSERT INTO sensor_history (sensor_id, recorded_at, temperature, moisture, movement, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sensor_id, formattedTime, temp, moist, move, status]
      );
  
      // (Opsional) Update status sensor utama jika perlu
      await pool.execute(
        `UPDATE sensors SET status = ? WHERE id = ?`,
        [status, sensor_id]
      );
  
      res.status(201).json({ message: 'Sensor log created' });
    } catch (err) {
        console.error('DB Insert Error:', err);
      res.status(500).json({ message: 'Error creating sensor log', error: err });
    }
  };
  
  export const exportSensorTrendCsv = async (req, res) => {
    const { range = '7d', metric = 'temperature' } = req.query;

    const validMetrics = ['temperature', 'moisture', 'movement'];
    const validRanges = {
        '24h': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90
    };

    if (!validMetrics.includes(metric)) {
        return res.status(400).json({ error: 'Invalid metric' });
    }

    const days = validRanges[range];
    if (!days) {
        return res.status(400).json({ error: 'Invalid time range' });
    }

    try {
        const [rows] = await pool.execute(
            `
            SELECT 
                DATE(recorded_at) AS date,
                AVG(${metric}) AS avg_value
            FROM sensor_history
            WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(recorded_at)
            ORDER BY date ASC
            `,
            [days]
        );

        if (!rows.length) {
            return res.status(404).json({ error: 'No data available for export' });
        }

        const fields = ['date', 'avg_value'];
        const parser = new Parser({ fields });
        const csv = parser.parse(rows);

        const filename = `sensor-${metric}-${range}-${new Date().toISOString().split('T')[0]}.csv`;

        res.header('Content-Type', 'text/csv');
        res.attachment(filename);
        res.send(csv);
    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};