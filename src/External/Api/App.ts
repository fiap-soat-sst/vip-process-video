import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../../../swagger.json';
import ProcessRoutes from './Routes/ProcessRoutes';

import dotenv from 'dotenv';
import { ExtractFramesRepository } from '../ExtractFrames/ExtractFramesRepository';
import { ExtractFramesUseCase } from '../../UseCases/extractFrames.usecase';

// Load environment variables
dotenv.config();

const app: Express = express();
app.use(express.json());

// Environment variables
const sourceBucket = process.env.SOURCE_BUCKET || '';
const destinationBucket = process.env.DESTINATION_BUCKET || '';

const extractFramesRepository = new ExtractFramesRepository();

const extractFramesUseCase = new ExtractFramesUseCase(
  extractFramesRepository,
  sourceBucket,
  destinationBucket
);

const processRoutes = new ProcessRoutes(
  extractFramesUseCase,
  extractFramesRepository
);

// Swagger documentation
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: { url: `${process.env.SWAGGER_URL}` },
  })
);

app.use('/api/process', processRoutes.buildRouter());

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'Internal Server Error',
      error:
        process.env.NODE_ENV === 'development'
          ? err.message
          : undefined,
    });
  }
);

export default app;
