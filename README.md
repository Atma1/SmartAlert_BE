# SmartAlert_BE

A comprehensive IoT sensor monitoring backend system built with Node.js, TypeScript, and MySQL. This system provides real-time monitoring, data analysis, and alert management for environmental sensors tracking temperature, moisture, and movement data.

## Features

- **Real-time Sensor Monitoring**: Track temperature, moisture, and movement data from IoT sensors
- **Alert System**: Automated status classification (Normal, Siaga, Bahaya) based on sensor thresholds
- **Historical Data**: Store and analyze sensor data trends over time
- **Report Management**: User-submitted incident reports with image upload support
- **Educational Content**: Manage educational materials about sensor safety and monitoring
- **Data Export**: Export sensor trends as CSV files for analysis
- **REST API**: Complete RESTful API for all system operations

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MySQL with mysql2 driver
- **File Upload**: Multer for image handling
- **Data Export**: json2csv for CSV generation
- **Development**: ts-node-dev for hot reloading

## Requirements

- **Node.js**: 16.x or higher
- **MySQL**: 8.0 or higher
- **npm**: 8.x or higher

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartAlert_BE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   DB_URI=mysql://username:password@localhost:3306/smartalert_db
   ```

4. **Database setup**
   ```bash
   # Create all tables
   npm run migrate:all
   
   # Seed with sample data
   npm run seed
   
   # Or reset database (drop + migrate + seed)
   npm run db:reset
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Database Schema

The system uses four main tables:

### Sensors
- `id`, `name`, `location`, `latitude`, `longitude`
- `temperature`, `moisture`, `movement`, `status`
- `lastUpdate`, `created_at`, `updated_at`

### Sensor History
- `id`, `sensor_id`, `timestamp`
- `temperature`, `moisture`, `movement`, `status`
- `created_at`

### Reports
- `id`, `name`, `location`, `description`
- `latitude`, `longitude`, `image_path`, `status`
- `created_at`, `updated_at`

### Education
- `id`, `title`, `content`, `summary`
- `category`, `image_url`, `tags`
- `createdAt`, `updatedAt`

## API Documentation

### Sensors API

#### GET /api/sensors
Get all sensors with their history
```json
{
  "id": 1,
  "name": "Sensor-001",
  "location": "Bukit A - Zona Timur",
  "latitude": -7.736771,
  "longitude": 112.430257,
  "temperature": 28.5,
  "moisture": 65.0,
  "movement": 0.5,
  "status": "Normal",
  "history": [...]
}
```

#### POST /api/sensors
Create a new sensor
```json
{
  "name": "Sensor-001",
  "location": "Location Name",
  "latitude": -7.736771,
  "longitude": 112.430257,
  "temperature": 28.5,
  "moisture": 65.0,
  "movement": 0.5
}
```

#### PATCH /api/sensors/:id
Update sensor data

#### DELETE /api/sensors/:id
Delete a sensor

#### GET /api/sensors/overview
Get sensor overview statistics

### Sensor History API

#### GET /api/sensor-history/summary
Get historical data summary
- Query params: `range` (24h, 7d, 30d, 90d)

#### GET /api/sensor-history/performance
Get sensor performance metrics

#### GET /api/sensor-history/status-distribution
Get status distribution statistics

#### POST /api/sensor-history
Create sensor log entry
```json
{
  "sensor_id": 1,
  "timestamp": "2023-12-01T10:00:00",
  "temperature": 28.5,
  "moisture": 65.0,
  "movement": 0.5
}
```

#### GET /api/sensor-history/export
Export sensor trends as CSV
- Query params: `range`, `metric`

### Reports API

#### GET /api/report
Get all reports

#### POST /api/report/submit
Submit a new report (multipart/form-data)
```
name: string
location: string
description: string
latitude: number (optional)
longitude: number (optional)
image: file (optional)
```

#### PATCH /api/report/:id/status
Update report status
```json
{
  "status": "pending" | "verified" | "resolved"
}
```

### Education API

#### GET /api/education
Get all educational content

#### POST /api/education
Create educational content

#### PATCH /api/education/:id
Update educational content

#### DELETE /api/education/:id
Delete educational content

## Status Classification

The system automatically classifies sensor status based on thresholds:

- **Bahaya** (Danger): Temperature ≥ 50°C OR Moisture ≤ 20% OR Movement ≥ 5
- **Siaga** (Alert): Temperature ≥ 35°C OR Moisture ≤ 40% OR Movement ≥ 2
- **Normal**: All values within safe ranges

## Development Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run migrate:all       # Create all tables
npm run seed             # Seed all tables
npm run db:reset         # Reset entire database

# Individual table operations
npm run migrate:sensors   # Create sensors table
npm run seed:sensors     # Seed sensors table
npm run drop:sensors     # Drop sensors table
```

## File Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts             # Server entry point
├── controllers/          # Request handlers
│   ├── sensorController.ts
│   ├── sensorHistoryController.ts
│   ├── reportController.ts
│   └── educationController.ts
├── routes/               # API routes
│   ├── sensorRoutes.ts
│   ├── sensorHistoryRoutes.ts
│   ├── reportRoutes.ts
│   └── educationRoutes.ts
├── models/               # Database models
│   ├── db.ts
│   └── sql/              # SQL schema files
├── seeds/                # Database seeders
│   ├── index.ts
│   ├── migrate*.ts       # Table creation
│   ├── seed*.ts          # Data seeding
│   └── drop*.ts          # Table dropping
└── uploads/              # File upload directory
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.