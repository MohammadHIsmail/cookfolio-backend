require('./jobs/otpCleanup');
require('./config/passport');   // registers the Google + Apple strategies

const passport = require('passport');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));
app.use(passport.initialize());

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;