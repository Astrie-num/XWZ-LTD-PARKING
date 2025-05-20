const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3004' })); // Updated to match frontend origin

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
  database: 'xwz-ltd-parking',
  password: 'vinniastrie!7',
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
    info: { 
      title: 'Parking Service API', 
      version: '1.0.0',
      description: 'API for managing parking lots'
    },
    servers: [{ url: 'http://localhost:3002' }],
    components: {
      securitySchemes: {
        bearerAuth: { 
          type: 'http', 
          scheme: 'bearer', 
          bearerFormat: 'JWT' 
        }
      }
    }
  },
  apis: ['index.js'] // Include this file for Swagger parsing
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/parkings:
 *   get:
 *     summary: Retrieve all parking lots
 *     description: Returns a list of all parking lots in the system.
 *     tags: [Parkings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of parking lots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The parking lot ID
 *                   code:
 *                     type: string
 *                     description: The unique code for the parking lot
 *                   parkingName:
 *                     type: string
 *                     description: The name of the parking lot
 *                   availableSpaces:
 *                     type: integer
 *                     description: Number of available parking spaces
 *                   location:
 *                     type: string
 *                     description: The location of the parking lot
 *                   chargingFeePerHour:
 *                     type: number
 *                     description: The hourly parking fee
 *       401:
 *         description: Access denied, no token provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Access denied
 *       403:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error
 */
app.get('/api/parkings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM parkings');
    res.json(result.rows);
  } catch (err) {
    logger.error(`Fetch parkings error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/parkings:
 *   post:
 *     summary: Create a new parking lot
 *     description: Creates a new parking lot (admin access required).
 *     tags: [Parkings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - parkingName
 *               - availableSpaces
 *               - location
 *               - chargingFeePerHour
 *             properties:
 *               code:
 *                 type: string
 *                 description: Unique code for the parking lot
 *               parkingName:
 *                 type: string
 *                 description: Name of the parking lot
 *               availableSpaces:
 *                 type: integer
 *                 description: Number of available parking spaces
 *               location:
 *                 type: string
 *                 description: Location of the parking lot
 *               chargingFeePerHour:
 *                 type: number
 *                 description: Hourly parking fee
 *     responses:
 *       201:
 *         description: Parking lot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parking lot added
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: All fields are required
 *       401:
 *         description: Access denied, no token provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Access denied
 *       403:
 *         description: Invalid token or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Admin access required
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error
 */
app.post('/api/parkings', authenticateToken, async (req, res) => {
  try {
    const { code, parkingName, availableSpaces, location, chargingFeePerHour } = req.body;
    if (!code || !parkingName || !availableSpaces || !location || !chargingFeePerHour) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    await pool.query(
      'INSERT INTO parkings (code, parkingName, availableSpaces, location, chargingFeePerHour) VALUES ($1, $2, $3, $4, $5)',
      [code, parkingName, availableSpaces, location, chargingFeePerHour]
    );
    logger.info(`Parking lot added: ${code}`);
    res.status(201).json({ message: 'Parking lot added' });
  } catch (err) {
    logger.error(`Add parking error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3002, () => logger.info('Parking Service running on port 3002'));