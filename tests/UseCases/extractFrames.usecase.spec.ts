import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { ExtractFramesUseCase } from '../../src/UseCases/extractFrames.usecase';
import QueueRequest from '../../src/Entities/QueueObject';

// Mock external dependencies
vi.mock('@aws-sdk/client-s3', () => {
  const S3Client = vi.fn();
  S3Client.prototype.send = vi.fn();
  return {
    S3Client,
    GetObjectCommand: vi.fn(),
    PutObjectCommand: vi.fn(),
  };
});
vi.mock('fs');
vi.mock('child_process');
vi.mock('path');
vi.mock('util', () => ({
  promisify: vi.fn((fn) => fn),
}));

describe('ExtractFramesUseCase', () => {
  let extractFramesUseCase: ExtractFramesUseCase;
  let mockUserGatewayRepository: any;
  let mockQueueRepository: any;
  let mockNotificationGateway: any;
  let mockExecAsync: any;
  let mockS3Send: any;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock environment variables
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_SNS_TOPIC = 'test-topic';

    // Mock execAsync
    mockExecAsync = vi
      .fn()
      .mockResolvedValue({ stdout: 'success', stderr: '' });
    vi.mocked(promisify).mockReturnValue(mockExecAsync);

    // Mock S3 send method
    mockS3Send = vi.fn();
    S3Client.prototype.send = mockS3Send;

    // Create mock repositories
    mockUserGatewayRepository = {
      saveUrlsProcessVideo: vi.fn().mockResolvedValue(undefined),
    };

    mockQueueRepository = {
      publish: vi.fn().mockResolvedValue(undefined),
    };

    mockNotificationGateway = {
      sendEmail: vi.fn().mockResolvedValue(undefined),
    };

    // Initialize the use case with mock dependencies
    extractFramesUseCase = new ExtractFramesUseCase(
      'source-bucket',
      'destination-bucket',
      mockUserGatewayRepository,
      mockQueueRepository,
      mockNotificationGateway
    );

    // Mock fs.promises
    vi.spyOn(fs.promises, 'mkdir').mockResolvedValue(undefined);
    vi.spyOn(fs.promises, 'writeFile').mockResolvedValue(undefined);
    vi.spyOn(fs.promises, 'readdir').mockResolvedValue([
      { name: 'frame-001.jpg' } as fs.Dirent,
      { name: 'frame-002.jpg' } as fs.Dirent,
    ]);
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue(
      Buffer.from('mock-image-data')
    );
    vi.spyOn(fs.promises, 'rm').mockResolvedValue(undefined);

    // Mock fs.existsSync
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

    // Mock path.join to return predictable paths
    vi.spyOn(path, 'join').mockImplementation((...args) =>
      args.join('/')
    );
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('should successfully process a video and extract frames', async () => {
    // Mock S3 response for GetObjectCommand
    const mockReadable = new Readable({
      read() {
        this.push(Buffer.from('mock-video-data'));
        this.push(null);
      },
    });

    // Setup S3 mock responses
    mockS3Send.mockImplementation(async (command: any) => {
      if (command instanceof GetObjectCommand) {
        return {
          Body: mockReadable,
          $metadata: { httpStatusCode: 200 },
        };
      }
      if (command instanceof PutObjectCommand) {
        return {
          $metadata: { httpStatusCode: 200 },
        };
      }
      return {};
    });

    const mockRequest = new QueueRequest('test@example.com', {
      id: 'test-video-id',
      name: 'video.mp4',
      size: 333444,
      contentType: 'video/mp4',
      managerService: {
        url: 'https://source-bucket.s3.region.amazonaws.com/test-video.mp4',
      },
      hash: 'hash',
    });

    await extractFramesUseCase.execute(mockRequest);

    expect(fs.promises.mkdir).toHaveBeenCalled();
    expect(fs.promises.writeFile).toHaveBeenCalled();
    // expect(mockExecAsync).toHaveBeenCalled();
    expect(
      mockUserGatewayRepository.saveUrlsProcessVideo
    ).toHaveBeenCalled();
    expect(mockQueueRepository.publish).toHaveBeenCalled();
    expect(fs.promises.rm).toHaveBeenCalled();
    expect(mockS3Send).toHaveBeenCalledWith(
      expect.any(GetObjectCommand)
    );
    expect(mockS3Send).toHaveBeenCalledWith(
      expect.any(PutObjectCommand)
    );
  });

  it('should handle errors and send notification when video processing fails', async () => {
    mockS3Send.mockRejectedValue(new Error('S3 Error'));

    const mockRequest = new QueueRequest('test@example.com', {
      id: 'test-video-id',
      name: 'video.mp4',
      size: 333444,
      contentType: 'video/mp4',
      managerService: {
        url: 'https://source-bucket.s3.region.amazonaws.com/test-video.mp4',
      },
      hash: 'hash',
    });

    await expect(
      extractFramesUseCase.execute(mockRequest)
    ).rejects.toThrow('S3 Error');

    expect(mockNotificationGateway.sendEmail).toHaveBeenCalledWith({
      type: 'ERROR',
      videoId: 'test-video-id',
      email: 'test@example.com',
      message: 'S3 Error',
    });
  });

  it('should create correct S3 URLs for uploaded frames', async () => {
    const mockReadable = new Readable({
      read() {
        this.push(Buffer.from('mock-video-data'));
        this.push(null);
      },
    });

    mockS3Send.mockImplementation(async (command: any) => {
      if (command instanceof GetObjectCommand) {
        return {
          Body: mockReadable,
          $metadata: { httpStatusCode: 200 },
        };
      }
      if (command instanceof PutObjectCommand) {
        return {
          $metadata: { httpStatusCode: 200 },
        };
      }
      return {};
    });

    const mockRequest = new QueueRequest('test@example.com', {
      id: 'test-video-id',
      name: 'video.mp4',
      size: 333444,
      contentType: 'video/mp4',
      managerService: {
        url: 'https://source-bucket.s3.region.amazonaws.com/test-video.mp4',
      },
      hash: 'hash',
    });

    await extractFramesUseCase.execute(mockRequest);

    expect(mockQueueRepository.publish).toHaveBeenCalledWith(
      'test-topic',
      expect.stringContaining(
        'destination-bucket.s3.us-east-1.amazonaws.com/test-video-id'
      )
    );
  });
});
