import express from 'express';
import { logger } from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import router from '#routes/auth.routes.js';
import { ApiError } from '#utils/apiError.js';
import globalErrorHandler from '#middleware/errorHandler.js';

const app = express();

// Security for requests
app.use(helmet());

// To allow json from incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// To log requests and send their message into the logger
app.use(
  morgan('combined', {
    stream: {
      write: message => {
        logger.info(message.trim());
      },
    },
  })
);

// To parse cookies from request
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello world!',
  });
});

app.get('/health', (req, res) =>
  res.status(200).json({
    message: 'Ok',
  })
);

app.get('/api', (req, res) =>
  res.status(200).json({
    message: 'Acquisition API running!',
  })
);

app.use('/api/v1/auth', router);

app.use((req, res, next) => {
  next(new ApiError(404, `Cannot find ${req.originalUrl}`));
});

// Global Error Handler LAST
app.use(globalErrorHandler);

export default app;
