import { Test, TestingModule } from '@nestjs/testing';
import { MoleculerService } from './moleculer.service';

describe('MoleculerService', () => {
  let service: MoleculerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoleculerService],
    }).compile();

    service = module.get<MoleculerService>(MoleculerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
