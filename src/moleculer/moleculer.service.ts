import { Injectable } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';

@Injectable()
export class MoleculerService {
  private broker;
  constructor() {
    if (process.env.TRANSPORTER) {
      this.broker = new ServiceBroker({
        transporter: process.env.TRANSPORTER,
      });
    }
  }
}
