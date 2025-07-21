const express = require('express');
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

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);


app.use(errorHandler)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));