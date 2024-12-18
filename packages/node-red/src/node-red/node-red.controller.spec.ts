import { Test, TestingModule } from '@nestjs/testing';
import { NodeRedController } from './node-red.controller';

describe('NodeRedController', () => {
  let controller: NodeRedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NodeRedController],
    }).compile();

    controller = module.get<NodeRedController>(NodeRedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
