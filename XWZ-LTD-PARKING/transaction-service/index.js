const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware for attendant role validation
const requireAttendant = (req, res, next) => {
  if (req.user.role !== 'attendant') {
    return res.status(403).json({ error: 'Attendant access required' });
  }
  next();
};

// Middleware for admin role validation
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: { title: 'Transaction Service API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3003' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ['./index.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/transactions/entry:
 *   post:
 *     summary: Record a vehicle entry to a parking lot
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plateNumber
 *               - parkingCode
 *             properties:
 *               plateNumber:
 *                 type: string
 *                 example: ABC123
 *               parkingCode:
 *                 type: string
 *                 example: PARK001
 *     responses:
 *       201:
 *         description: Vehicle entry recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     plateNumber:
 *                       type: string
 *                       example: ABC123
 *                     parkingCode:
 *                       type: string
 *                       example: PARK001
 *                     entryDateTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-05-20T13:12:00.000Z
 *       400:
 *         description: Missing required fields or no available spaces
 *       403:
 *         description: Attendant access required
 *       500:
 *         description: Server error
 */
app.post('/api/transactions/entry', authenticateToken, requireAttendant, async (req, res) => {
  try {
    const { plateNumber, parkingCode } = req.body;
    if (!plateNumber || !parkingCode) {
      return res.status(400).json({ error: 'Plate number and parking code are required' });
    }
    const parking = await pool.query('SELECT "availableSpaces", "chargingFeePerHour" FROM parkings WHERE "code" = $1', [parkingCode]);
    if (parking.rows.length === 0 || parking.rows[0].availableSpaces <= 0) {
      return res.status(400).json({ error: 'No available spaces' });
    }
    const id = uuidv4();
    const entryDateTime = new Date().toISOString();
    await pool.query(
      'INSERT INTO transactions ("id", "userId", "plateNumber", "parkingCode", "entryDateTime", "chargedAmount") VALUES ($1, $2, $3, $4, $5, $6)',
      [id, req.user.id, plateNumber, parkingCode, entryDateTime, 0]
    );
    await pool.query('UPDATE parkings SET "availableSpaces" = "availableSpaces" - 1 WHERE "code" = $1', [parkingCode]);
    logger.info(`Car entered: ${plateNumber}, Parking: ${parkingCode}`);
    res.status(201).json({ ticket: { id, plateNumber, parkingCode, entryDateTime } });
  } catch (err) {
    logger.error(`Car entry error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/transactions/exit:
 *   post:
 *     summary: Record a vehicle exit from a parking lot
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Vehicle exit recorded successfully with billing details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bill:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     plateNumber:
 *                       type: string
 *                       example: ABC123
 *                     hours:
 *                       type: number
 *                       example: 2.5
 *                     chargedAmount:
 *                       type: number
 *                       example: 7.50
 *                     exitDateTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-05-20T15:42:00.000Z
 *       400:
 *         description: Invalid transaction
 *       403:
 *         description: Attendant access required
 *       500:
 *         description: Server error
 */
app.post('/api/transactions/exit', authenticateToken, requireAttendant, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }
    const transaction = await pool.query('SELECT * FROM transactions WHERE "id" = $1 AND "exitDateTime" IS NULL', [id]);
    if (transaction.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or already exited transaction' });
    }
    const parking = await pool.query('SELECT "chargingFeePerHour" FROM parkings WHERE "code" = $1', [transaction.rows[0].parkingCode]);
    const entryTime = new Date(transaction.rows[0].entryDateTime);
    const exitTime = new Date();
    const hours = (exitTime - entryTime) / (1000 * 60 * 60);
    const chargedAmount = hours * parking.rows[0].chargingFeePerHour;
    await pool.query(
      'UPDATE transactions SET "exitDateTime" = $1, "chargedAmount" = $2 WHERE id = $3',
      [exitTime.toISOString(), chargedAmount, id]
    );
    await pool.query('UPDATE parkings SET "availableSpaces" = "availableSpaces" + 1 WHERE "code" = $1', [transaction.rows[0].parkingCode]);
    logger.info(`Car exited: ${id}, Amount: ${chargedAmount}`);
    res.json({ bill: { id, plateNumber: transaction.rows[0].plateNumber, hours, chargedAmount, exitDateTime: exitTime.toISOString() } });
  } catch (err) {
    logger.error(`Car exit error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/transactions/user:
 *   get:
 *     summary: Get transactions for the authenticated user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of user transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       plateNumber:
 *                         type: string
 *                       parkingCode:
 *                         type: string
 *                       entryDateTime:
 *                         type: string
 *                         format: date-time
 *                       exitDateTime:
 *                         type: string
 *                         format: date-time
 *                       chargedAmount:
 *                         type: number
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Access denied
 *       403:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */
app.get('/api/transactions/user', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const result = await pool.query(
      'SELECT "id", "plateNumber", "parkingCode", "entryDateTime", "exitDateTime", "chargedAmount" FROM transactions WHERE "userId" = $1 ORDER BY "entryDateTime" DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM transactions WHERE "userId" = $1',
      [req.user.id]
    );
    const totalRecords = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalRecords / limit);
    logger.info(`Fetched transactions for user: ${req.user.id}`);
    res.json({ transactions: result.rows, totalPages });
  } catch (err) {
    logger.error(`Fetch transactions error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/transactions/reports:
 *   get:
 *     summary: Get transaction reports for a date range (admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: true
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: true
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [incoming, outgoing]
 *         required: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       plateNumber:
 *                         type: string
 *                       parkingCode:
 *                         type: string
 *                       entryDateTime:
 *                         type: string
 *                         format: date-time
 *                       exitDateTime:
 *                         type: string
 *                         format: date-time
 *                       chargedAmount:
 *                         type: number
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Access denied
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
app.get('/api/transactions/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, type, page = 1, limit = 10 } = req.query;
    if (!startDate || !endDate || !type) {
      return res.status(400).json({ error: 'startDate, endDate, and type are required' });
    }
    const offset = (page - 1) * limit;
    let query = 'SELECT "id", "plateNumber", "parkingCode", "entryDateTime", "exitDateTime", "chargedAmount" FROM transactions WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE 1=1';
    const params = [];
    if (type === 'incoming') {
      query += ' AND "entryDateTime" IS NOT NULL';
      countQuery += ' AND "entryDateTime" IS NOT NULL';
      if (startDate) {
        params.push(startDate);
        query += ` AND "entryDateTime" >= $${params.length}`;
        countQuery += ` AND "entryDateTime" >= $${params.length}`;
      }
      if (endDate) {
        params.push(endDate);
        query += ` AND "entryDateTime" <= $${params.length}`;
        countQuery += ` AND "entryDateTime" <= $${params.length}`;
      }
    } else if (type === 'outgoing') {
      query += ' AND "exitDateTime" IS NOT NULL';
      countQuery += ' AND "exitDateTime" IS NOT NULL';
      if (startDate) {
        params.push(startDate);
        query += ` AND "exitDateTime" >= $${params.length}`;
        countQuery += ` AND "exitDateTime" >= $${params.length}`;
      }
      if (endDate) {
        params.push(endDate);
        query += ` AND "exitDateTime" <= $${params.length}`;
        countQuery += ` AND "exitDateTime" <= $${params.length}`;
      }
    } else {
      return res.status(400).json({ error: 'Invalid type. Must be "incoming" or "outgoing"' });
    }
    query += ` ORDER BY ${type === 'incoming' ? '"entryDateTime"' : '"exitDateTime"'} DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const totalRecords = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalRecords / limit);
    logger.info(`Fetched ${type} reports for admin`);
    res.json({ transactions: result.rows, totalPages });
  } catch (err) {
    logger.error(`Fetch reports error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(3003, () => {
  logger.info('Transaction Service running on port 3003');
});