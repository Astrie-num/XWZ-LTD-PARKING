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
    info: { title: 'Transaction Service API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3003' }],
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
app.post('/api/transactions/entry', authenticateToken, async (req, res) => {
  if (req.user.role !== 'attendant') return res.status(403).json({ error: 'Attendant access required' });
  try {
    const { plateNumber, parkingCode } = req.body;
    if (!plateNumber || !parkingCode) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const parking = await pool.query('SELECT availableSpaces, chargingFeePerHour FROM parkings WHERE code = $1', [parkingCode]);
    if (parking.rows.length === 0 || parking.rows[0].availableSpaces <= 0) {
      return res.status(400).json({ error: 'No available spaces' });
    }
    const id = uuidv4();
    const entryDateTime = new Date().toISOString();
    await pool.query(
      'INSERT INTO transactions (id, plateNumber, parkingCode, entryDateTime, chargedAmount, userId) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, plateNumber, parkingCode, entryDateTime, 0, req.user.id]
    );
    await pool.query('UPDATE parkings SET availableSpaces = availableSpaces - 1 WHERE code = $1', [parkingCode]);
    logger.info(`Car entered: ${plateNumber}, Parking: ${parkingCode}`);
    res.json({ ticket: { id, plateNumber, parkingCode, entryDateTime } });
  } catch (err) {
    logger.error(`Car entry error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/transactions/exit', authenticateToken, async (req, res) => {
  if (req.user.role !== 'attendant') return res.status(403).json({ error: 'Attendant access required' });
  try {
    const { id } = req.body;
    const transaction = await pool.query('SELECT * FROM transactions WHERE id = $1 AND exitDateTime IS NULL', [id]);
    if (transaction.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid transaction' });
    }
    const parking = await pool.query('SELECT chargingFeePerHour FROM parkings WHERE code = $1', [transaction.rows[0].parkingCode]);
    const entryTime = new Date(transaction.rows[0].entryDateTime);
    const exitTime = new Date();
    const hours = (exitTime - entryTime) / (1000 * 60 * 60);
    const chargedAmount = hours * parking.rows[0].chargingFeePerHour;
    await pool.query(
      'UPDATE transactions SET exitDateTime = $1, chargedAmount = $2 WHERE id = $3',
      [exitTime.toISOString(), chargedAmount, id]
    );
    await pool.query('UPDATE parkings SET availableSpaces = availableSpaces + 1 WHERE code = $1', [transaction.rows[0].parkingCode]);
    logger.info(`Car exited: ${id}, Amount: ${chargedAmount}`);
    res.json({ bill: { id, plateNumber: transaction.rows[0].plateNumber, hours, chargedAmount, exitDateTime: exitTime.toISOString() } });
  } catch (err) {
    logger.error(`Car exit error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/transactions/user', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const result = await pool.query(
      'SELECT * FROM transactions WHERE userId = $1 ORDER BY entryDateTime DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    logger.error(`Fetch transactions error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/transactions/reports', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    const { startDate, endDate, type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let query = '';
    if (type === 'outgoing') {
      query = 'SELECT * FROM transactions WHERE exitDateTime BETWEEN $1 AND $2 ORDER BY exitDateTime DESC LIMIT $3 OFFSET $4';
    } else {
      query = 'SELECT * FROM transactions WHERE entryDateTime BETWEEN $1 AND $2 ORDER BY entryDateTime DESC LIMIT $3 OFFSET $4';
    }
    const result = await pool.query(query, [startDate, endDate, limit, offset]);
    res.json(result.rows);
  } catch (err) {
    logger.error(`Report error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3003, () => logger.info('Transaction Service running on port 3003'));