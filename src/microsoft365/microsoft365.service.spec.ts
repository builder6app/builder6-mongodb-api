import { Test, TestingModule } from '@nestjs/testing';
import { Microsoft365Service } from './microsoft365.service';

describe('Microsoft365Service', () => {
  let service: Microsoft365Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Microsoft365Service],
    }).compile();

    service = module.get<Microsoft365Service>(Microsoft365Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
