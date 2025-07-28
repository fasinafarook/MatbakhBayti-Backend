const express = require('express');
const cors = require('cors')
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

app.use(
  cors({
    origin: 'https://matbakh-bayti.vercel.app', 
    credentials: true, 
  })
);

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);


app.use(errorHandler)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


app.use(errorHandler)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
