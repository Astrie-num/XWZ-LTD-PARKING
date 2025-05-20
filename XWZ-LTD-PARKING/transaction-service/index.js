const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3004' }));

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
    info: { title: 'Transaction Service API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3003' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ['index.js'] 
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
 *       200:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: All fields are required
 *       403:
 *         description: Attendant access required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Attendant access required
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
app.post('/api/transactions/entry', authenticateToken, async (req, res) => {
  if (req.user.role !== 'attendant') return res.status(403).json({ error: 'Attendant access required' });
  try {
    const { plateNumber, parkingCode } = req.body;
    if (!plateNumber || !parkingCode) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const parking = await pool.query('SELECT "availableSpaces", "chargingFeePerHour" FROM parkings WHERE "code" = $1', [parkingCode]);
    if (parking.rows.length === 0 || parking.rows[0].availableSpaces <= 0) {
      return res.status(400).json({ error: 'No available spaces' });
    }
    const id = uuidv4();
    const entryDateTime = new Date().toISOString();
    await pool.query(
      'INSERT INTO transactions ("id", "plateNumber", "parkingCode", "entryDateTime", "chargedAmount", "userId") VALUES ($1, $2, $3, $4, $5, $6)',
      [id, plateNumber, parkingCode, entryDateTime, 0, req.user.id]
    );
    await pool.query('UPDATE parkings SET "availableSpaces" = "availableSpaces" - 1 WHERE "code" = $1', [parkingCode]);
    logger.info(`Car entered: ${plateNumber}, Parking: ${parkingCode}`);
    res.json({ ticket: { id, plateNumber, parkingCode, entryDateTime } });
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid transaction
 *       403:
 *         description: Attendant access required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Attendant access required
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
app.post('/api/transactions/exit', authenticateToken, async (req, res) => {
  if (req.user.role !== 'attendant') return res.status(403).json({ error: 'Attendant access required' });
  try {
    const { id } = req.body;
    const transaction = await pool.query('SELECT * FROM transactions WHERE "id" = $1 AND "exitDateTime" IS NULL', [id]);
    if (transaction.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid transaction' });
    }
    const parking = await pool.query('SELECT "chargingFeePerHour" FROM parkings WHERE "code" = $1', [transaction.rows[0].parkingCode]);
    const entryTime = new Date(transaction.rows[0].entryDateTime);
    const exitTime = new Date();
    const hours = (exitTime - entryTime) / (1000 * 60 * 60);
    const chargedAmount = hours * parking.rows[0].chargingFeePerHour;
    await pool.query(
      'UPDATE transactions SET "exitDateTime" = $1, "chargedAmount" = $2 WHERE "id" = $3',
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
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of transactions per page
 *     responses:
 *       200:
 *         description: List of user transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 123e4567-e89b-12d3-a456-426614174000
 *                   plateNumber:
 *                     type: string
 *                     example: ABC123
 *                   parkingCode:
 *                     type: string
 *                     example: PARK001
 *                   entryDateTime:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-05-20T13:12:00.000Z
 *                   exitDateTime:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-05-20T15:42:00.000Z
 *                   chargedAmount:
 *                     type: number
 *                     example: 7.50
 *                   userId:
 *                     type: string
 *                     example: 987e6543-e21b-12d3-a456-426614174000
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
app.get('/api/transactions/user', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const result = await pool.query(
      'SELECT * FROM transactions WHERE "userId" = $1 ORDER BY "entryDateTime" DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );
    res.json(result.rows);
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
 *         description: Start date for the report
 *         example: 2025-05-01T00:00:00.000Z
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: true
 *         description: End date for the report
 *         example: 2025-05-20T23:59:59.999Z
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [incoming, outgoing]
 *         required: true
 *         description: Type of transactions to report (incoming or outgoing)
 *         example: outgoing
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of transactions per page
 *     responses:
 *       200:
 *         description: List of transactions for the specified date range
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 123e4567-e89b-12d3-a456-426614174000
 *                   plateNumber:
 *                     type: string
 *                     example: ABC123
 *                   parkingCode:
 *                     type: string
 *                     example: PARK001
 *                   entryDateTime:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-05-20T13:12:00.000Z
 *                   exitDateTime:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-05-20T15:42:00.000Z
 *                   chargedAmount:
 *                     type: number
 *                     example: 7.50
 *                   userId:
 *                     type: string
 *                     example: 987e6543-e21b-12d3-a456-426614174000
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
 *         description: Admin access required or invalid token
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
app.get('/api/transactions/reports', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    const { startDate, endDate, type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let query = '';
    if (type === 'outgoing') {
      query = 'SELECT * FROM transactions WHERE "exitDateTime" BETWEEN $1 AND $2 ORDER BY "exitDateTime" DESC LIMIT $3 OFFSET $4';
    } else {
      query = 'SELECT * FROM transactions WHERE "entryDateTime" BETWEEN $1 AND $2 ORDER BY "entryDateTime" DESC LIMIT $3 OFFSET $4';
    }
    const result = await pool.query(query, [startDate, endDate, limit, offset]);
    res.json(result.rows);
  } catch (err) {
    logger.error(`Report error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3003, () => logger.info('Transaction Service running on port 3003'));