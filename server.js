const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitizer = require('express-mongo-sanitize');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');
const cors = require('cors');

//Load env vars
dotenv.config({ path: './config/config.env' });

//connect to database
connectDB();

//Route Files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

//dev logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// cookie parser
app.use(cookieParser());

// Body Parser
app.use(express.json());

// File upload middleware
app.use(fileupload());

// mongo sanitize
app.use(mongoSanitizer());

// Set Security Headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate Limit
const limit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use(limit);

// Prevent http Param Pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on ${PORT}`.yellow.bold
  )
);

//handle unhandled pomise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  server.close(() => {
    process.exit(1);
  });
});
