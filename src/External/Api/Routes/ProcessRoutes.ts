import { Router } from 'express';
import { ExtractFramesUseCase } from '../../../UseCases/extractFrames.usecase';
import ProcessController from '../../../Controllers/ProcessController';

export default class ProcessRoutes {
  private extractFramesUseCase: ExtractFramesUseCase;  

  constructor(
    extractFramesUseCase: ExtractFramesUseCase,
  ) {
    this.extractFramesUseCase = extractFramesUseCase;
  }

  buildRouter(): Router {
    const router = Router();
    const controller = new ProcessController(
      this.extractFramesUseCase,      
    );

    router.post('/', (req, res) => controller.process(req, res));    

    return router;
  }
}
