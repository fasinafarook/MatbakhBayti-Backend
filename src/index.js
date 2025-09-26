const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes/userRoute');
const adminRoutes = require('./routes/adminRoutes/adminRoute');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Only ONE cors config should exist
app.use(
  cors({
    origin: 'https://matbakh-bayti.vercel.app',
    credentials: true,
  })
);

// Routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

