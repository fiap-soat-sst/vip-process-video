import { describe, it, beforeEach, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import ProcessController from '../../src/Controllers/ProcessController';
import { ExtractFramesUseCase } from '../../src/UseCases/extractFrames.usecase';
import QueueRequest from '../../src/Entities/QueueObject';
import UserGatewayRepository from '../../src/Gateways/User/UserGatewayRepository';
import DynamoDBUserRepository from '../../src/External/Database/Repositories/DatabaseRepository/DynamoDBUserRepository';
import { DynamoDBAdapter } from '../../src/External/Database/DynamoDbAdapter';
import SNSQueueProvider from '../../src/External/Queue/Provider/SNSQueueProvider';
import QueueGateway from '../../src/Gateways/Queue/queueGateway';
import NotificationGateway from '../../src/Gateways/Notification/NotificationGateway';

describe('ProcessController', () => {
  let extractFramesUseCase: ExtractFramesUseCase;
  let processController: ProcessController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    const dataBaseAdapter = new DynamoDBAdapter();
    const userRepository = new DynamoDBUserRepository(
      dataBaseAdapter
    );
    const userGatewayRepository = new UserGatewayRepository(
      userRepository
    );
    const snsQueueProvider = new SNSQueueProvider();
    const queueGateway = new QueueGateway(snsQueueProvider);
    const notificationGateway = new NotificationGateway(
      'notification-endpoint'
    );

    extractFramesUseCase = new ExtractFramesUseCase(
      'sourceBucket',
      'destinationBucket',
      userGatewayRepository,
      queueGateway,
      notificationGateway
    );
    processController = new ProcessController(extractFramesUseCase);
    req = {
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      json: vi.fn(),
    };
  });

  it('should process valid request', async () => {
    req.body = {
      Message: JSON.stringify({
        email: 'test@example.com',
        video: 'video.mp4',
      }),
    };
    vi.spyOn(QueueRequest, 'fromJson').mockReturnValue(
      new QueueRequest('test@example.com', {
        id: 'id',
        name: 'video.mp4',
        size: 333444,
        contentType: 'video/mp4',
        managerService: {
          url: 'url',
        },
        hash: 'hash',
      })
    );
    vi.spyOn(extractFramesUseCase, 'execute').mockResolvedValue(
      undefined
    );

    await processController.process(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return 200 if email is missing', async () => {
    req.body = { Message: JSON.stringify({ video: 'video.mp4' }) };

    await processController.process(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return 200 if video is missing', async () => {
    req.body = {
      Message: JSON.stringify({ email: 'test@example.com' }),
    };

    await processController.process(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return 500 if JSON is invalid', async () => {
    req.body = { Message: 'invalid JSON' };

    await processController.process(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal server error while processing video',
      error: expect.any(String),
    });
  });

  it('should return 500 if an error occurs during processing', async () => {
    req.body = {
      Message: JSON.stringify({
        email: 'test@example.com',
        video: 'video.mp4',
      }),
    };
    vi.spyOn(QueueRequest, 'fromJson').mockReturnValue(
      new QueueRequest('test@example.com', {
        id: 'id',
        name: 'video.mp4',
        size: 333444,
        contentType: 'video/mp4',
        managerService: {
          url: 'url',
        },
        hash: 'hash',
      })
    );
    vi.spyOn(extractFramesUseCase, 'execute').mockRejectedValue(
      new Error('Processing error')
    );

    await processController.process(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal server error while processing video',
      error: 'Processing error',
    });
  });
});
