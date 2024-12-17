import { Service, Context, ServiceBroker } from 'moleculer';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectBroker } from '@builder6/moleculer';
import { NodeRedService } from './node-red.service';

@Injectable()
export class NodeRedMoleculer extends Service {
    constructor(@InjectBroker() broker: ServiceBroker
    ) {
        super(broker);

        this.parseServiceSchema({
            name: "@builder6/node-red/moleculer",
            settings: {
            },
            actions: {
                getPreSignedUrl: this.getPreSignedUrl,
            },
            created: this.serviceCreated,
            started: this.serviceStarted,
            stopped: this.serviceStopped,
        });
    }

    serviceCreated() {
    }

    async serviceStarted() {
    }

    async serviceStopped() {
    }

    async getPreSignedUrl(ctx: Context) {
       return {}
    }
}