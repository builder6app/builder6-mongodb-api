import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceBroker } from 'moleculer';

import moleculerConfig from './moleculer.config';

@Injectable()
export class MoleculerService {
  private broker;
  constructor(private configService: ConfigService) {
    const transporter = configService.get("transporter");
    if (transporter) {
      this.broker = new ServiceBroker(moleculerConfig);
    }
  }
}
