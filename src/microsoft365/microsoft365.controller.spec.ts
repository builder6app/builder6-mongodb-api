import { Test, TestingModule } from '@nestjs/testing';
import { Microsoft365Controller } from './microsoft365.controller';

describe('Microsoft365Controller', () => {
  let controller: Microsoft365Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Microsoft365Controller],
    }).compile();

    controller = module.get<Microsoft365Controller>(Microsoft365Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
