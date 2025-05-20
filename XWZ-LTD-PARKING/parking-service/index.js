const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost' }));

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

// PostgreSQL setup
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'parking_db',
  password: 'password',
  port: 5432
});

// JWT secret
const JWT_SECRET = 'your_jwt_secret';

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: { title: 'Parking Service API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3002' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: []
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.post('/api/parkings', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    const { code, parkingName, availableSpaces, location, chargingFeePerHour } = req.body;
    if (!code || !parkingName || !availableSpaces || !location || !chargingFeePerHour) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    await pool.query(
      'INSERT INTO parkings (code, parkingName, availableSpaces, location, chargingFeePerHour) VALUES ($1, $2, $3, $4, $5)',
      [code, parkingName, availableSpaces, location, chargingFeePerHour]
    );
    logger.info(`Parking lot created: ${code}`);
    res.status(201).json({ message: 'Parking lot created' });
  } catch (err) {
    logger.error(`Create parking error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/parkings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM parkings');
    res.json(result.rows);
  } catch (err) {
    logger.error(`Fetch parkings error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3002, () => logger.info('Parking Service running on port 3002'));