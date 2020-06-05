const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');

//Load env vars
dotenv.config({ path: './config/config.env' });

//connect to database
connectDB();

//Route Files
const bootcamps = require('./routes/bootcamps');
const app = express();

//dev logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Body Parser
app.use(express.json());

app.use('/api/v1/bootcamps', bootcamps);

app.use(errorHandler);

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
