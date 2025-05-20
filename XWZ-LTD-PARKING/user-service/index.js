const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const winston = require('winston');
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
    info: { title: 'User Service API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3001' }],
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
app.post('/api/users/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await pool.query(
      'INSERT INTO users (id, firstName, lastName, email, password, role) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, firstName, lastName, email, hashedPassword, role || 'user']
    );
    logger.info(`User registered: ${email}`);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    logger.error(`Registration error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    logger.info(`User logged in: ${email}`);
    res.json({ token });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, firstName, lastName, email, role FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    logger.error(`Fetch user error: ${err.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3001, () => logger.info('User Service running on port 3001'));