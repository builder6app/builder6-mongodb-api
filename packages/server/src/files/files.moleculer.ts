import { Service, Context, ServiceBroker } from 'moleculer';
import { Inject, Injectable } from '@nestjs/common';
import { InjectBroker } from '@builder6/moleculer';
import { FilesService } from './files.service';

@Injectable()
export class FilesMoleculer extends Service {
    constructor(@InjectBroker() broker: ServiceBroker,
        private filesService: FilesService,
    ) {
        super(broker);

        this.parseServiceSchema({
            name: "@builder6/files",
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
        const {collectionName, fileId} = ctx.params as any;

        return this.filesService.getPreSignedUrl(collectionName, fileId);
    }
}