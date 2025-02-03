import { Router } from 'express';
import { ExtractFramesUseCase } from '../../../UseCases/extractFrames.usecase';
import { ExtractFramesRepository } from '../../ExtractFrames/ExtractFramesRepository';
import ProcessController from '../../../Controllers/ProcessController';

export default class ProcessRoutes {
  private extractFramesUseCase: ExtractFramesUseCase;
  private extractFramesRepository: ExtractFramesRepository;

  constructor(
    extractFramesUseCase: ExtractFramesUseCase,
    extractFramesRepository: ExtractFramesRepository
  ) {
    this.extractFramesUseCase = extractFramesUseCase;
    this.extractFramesRepository = extractFramesRepository;
  }

  buildRouter(): Router {
    const router = Router();
    const controller = new ProcessController(
      this.extractFramesUseCase,
      this.extractFramesRepository
    );

    router.post('/', (req, res) => controller.process(req, res));
    router.get('/status/:videoId', (req, res) =>
      controller.status(req, res)
    );

    return router;
  }
}
