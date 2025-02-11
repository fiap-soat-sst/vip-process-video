import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../../../swagger.json';
import ProcessRoutes from './Routes/ProcessRoutes';

import dotenv from 'dotenv';
import { ExtractFramesUseCase } from '../../UseCases/extractFrames.usecase';
import UserGatewayRepository from '../../Gateways/User/UserGatewayRepository';
import DynamoDBUserRepository from '../Database/Repositories/DatabaseRepository/DynamoDBUserRepository';
import { DynamoDBAdapter } from '../Database/DynamoDbAdapter';
import QueueGateway from '../../Gateways/Queue/queueGateway';
import SNSQueueProvider from '../Queue/Provider/SNSQueueProvider';

// Load environment variables
dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(
  express.json({
    type: [
      'application/json',
      'text/plain', // AWS sends this content-type for its messages/notifications
    ],
  })
);

// Environment variables
const sourceBucket =
  process.env.AWS_S3_BUCKET_SOURCE || 'teste-upload-videos-hackaton';
const destinationBucket =
  process.env.AWS_S3_BUCKET_DESTINATION || 'upload-video-frames';

const dataBaseAdapter = new DynamoDBAdapter();
const userRepository = new DynamoDBUserRepository(dataBaseAdapter);
const userGatewayRepository = new UserGatewayRepository(
  userRepository
);
const snsQueueProvider = new SNSQueueProvider();
const queueGateway = new QueueGateway(snsQueueProvider);

const extractFramesUseCase = new ExtractFramesUseCase(
  sourceBucket,
  destinationBucket,
  userGatewayRepository,
  queueGateway
);

const processRoutes = new ProcessRoutes(extractFramesUseCase);

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
