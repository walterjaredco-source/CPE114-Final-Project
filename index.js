require('dotenv').config();

const express    = require('express');
const sequelize  = require('./config/database');
require('./models'); // register all models and associations

const logger       = require('./middleware/logger');
const notFound     = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const authorRoutes = require('./routes/authorRoutes');
const bookRoutes   = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middleware ───────────────────────────────────────────────────────
app.use(express.json());
app.use(logger);

// ─── Routes ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Library System API',
    version: '1.0.0',
    endpoints: {
      authors: '/api/authors',
      books:   '/api/books',
      members: '/api/members',
      borrows: '/api/borrows',
    },
  });
});

app.use('/api/authors', authorRoutes);
app.use('/api/books',   bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/borrows', borrowRoutes);

// ─── 404 and Error Handlers (must be last) ───────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
sequelize
  .sync({ alter: false })
  .then(() => {
    console.log('✅ Database synced successfully.');
    app.listen(PORT, () => {
      console.log(`🚀 Library System API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to sync database:', err.message);
    process.exit(1);
  });
