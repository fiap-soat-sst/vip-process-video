import { Request, Response } from 'express';
import { Either, Left, Right, isLeft } from '../@Shared/Either';
import { ExtractFramesUseCase } from '../UseCases/extractFrames.usecase';
import QueueRequest from '../Entities/QueueObject';
import { ExtractFramesRepository } from '../External/ExtractFrames/ExtractFramesRepository';

interface ProcessVideoError {
  message: string;
}

export default class ProcessController {
  private extractFramesUseCase: ExtractFramesUseCase;
  private extractFramesRepository: ExtractFramesRepository;

  constructor(
    extractFramesUseCase: ExtractFramesUseCase,
    extractFramesRepository: ExtractFramesRepository
  ) {
    this.extractFramesUseCase = extractFramesUseCase;
    this.extractFramesRepository = extractFramesRepository;
  }

  async process(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = this.validateRequest(req);
      if (isLeft(validationResult)) {
        res.status(400).json(validationResult.value);
        return;
      }

      const queueRequest = QueueRequest.fromJson({
        email: req.body.email,
        videos: req.body.videos,
      });

      await this.extractFramesUseCase.execute(queueRequest);

      res.status(200).json({
        message: 'Video processing started successfully',
        requestId: queueRequest.getVideos()[0].id, // Assuming at least one video
      });
    } catch (error) {
      console.error('Error processing video:', error);
      res.status(500).json({
        message: 'Internal server error while processing video',
        error:
          error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async status(req: Request, res: Response): Promise<void> {
    try {
      const videoId = req.params.videoId;
      if (!videoId) {
        res.status(400).json({
          message: 'Video ID is required',
        });
        return;
      }

      const video = await this.extractFramesRepository.getVideoById(
        videoId
      );

      if (!video) {
        res.status(404).json({
          message: 'Video not found',
        });
        return;
      }

      res.status(200).json({
        id: video.id,
        status: video.status,
        updatedAt: video.updatedAt,
      });
    } catch (error) {
      console.error('Error getting video status:', error);
      res.status(500).json({
        message: 'Internal server error while getting video status',
        error:
          error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private validateRequest(
    req: Request
  ): Either<ProcessVideoError, boolean> {
    if (!req.body.email) {
      return Left({ message: 'Email is required' });
    }

    if (
      !req.body.videos ||
      !Array.isArray(req.body.videos) ||
      req.body.videos.length === 0
    ) {
      return Left({ message: 'At least one video is required' });
    }

    for (const video of req.body.videos) {
      if (
        !video.id ||
        !video.name ||
        !video.size ||
        !video.contentType ||
        !video.managerService?.url
      ) {
        return Left({
          message:
            'Each video must have id, name, size, contentType, and managerService.url',
        });
      }
    }

    return Right(true);
  }
}
