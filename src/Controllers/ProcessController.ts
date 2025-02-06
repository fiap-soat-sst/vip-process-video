import { Request, Response } from 'express';
import { ExtractFramesUseCase } from '../UseCases/extractFrames.usecase';
import QueueRequest from '../Entities/QueueObject';


export default class ProcessController {
  private extractFramesUseCase: ExtractFramesUseCase;  

  constructor(
    extractFramesUseCase: ExtractFramesUseCase,    
  ) {
    this.extractFramesUseCase = extractFramesUseCase;    
  }

  async process(req: Request, res: Response): Promise<void> {
    try {
      const { body } = req;
      const { Message } = body;
      const messageParsed = JSON.parse(Message);

      if (!messageParsed || !messageParsed.email) {
        res.status(200).send();
      }

      if (!messageParsed.video) {
        res.status(200).send();
      }

      const queueRequest = QueueRequest.fromJson({
        email: messageParsed.email,
        video: messageParsed.video,
      });

      await this.extractFramesUseCase.execute(queueRequest);

      res.status(200).send();
    } catch (error) {
      console.error('Error processing video:', error);
      res.status(500).json({
        message: 'Internal server error while processing video',
        error:
          error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }  
}
