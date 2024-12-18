import { Test, TestingModule } from '@nestjs/testing';
import { NodeRedService } from './node-red.service';

describe('NodeRedService', () => {
  let service: NodeRedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NodeRedService],
    }).compile();

    service = module.get<NodeRedService>(NodeRedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
