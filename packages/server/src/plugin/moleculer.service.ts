import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceBroker } from 'moleculer';
import * as fs from 'fs';
import * as path from 'path';
import { InjectBroker } from "@builder6/moleculer";


@Injectable()
export class MoleculerPluginService {
  private readonly logger = new Logger(MoleculerPluginService.name);

  constructor(
    private configService: ConfigService,
    @InjectBroker() private readonly broker: ServiceBroker,
  ) {
    const transporter = this.configService.get('transporter');
    if (!transporter) {
      console.error('B6_TRANSPORTER env is required.');
      return;
    }
    this.loadServices();
  }

  loadServices() {
    // @builder6/plugin-tables@0.5.6,@builder6/plugin-pages@0.5.1,
    const plugins = this.configService.get('plugin.services');
    if (plugins) {
      for (const plugin of plugins.split(',')) {
        // 解析 plugin npm 名称和 版本号。例如： @builder6/plugin-tables
        // 检测 npm 包是否存在
        // 检测 npm 包中是否包含 './dist/plugin.service.ts'
        // 引入此文件，并创建包服务
        this.loadService(plugin);
      }
    }
  }

  loadService(plugin) {
    try {
      // 解析插件名称和版本号
      const match = plugin.match(/^(.*?)(?:@([\d.]+))?$/);
      if (!match) {
        this.logger.warn(`服务插件格式无效: ${plugin}`);
        return;
      }

      const [, packageName] = match;
      this.logger.log(`加载服务插件: 名称：${packageName}`);

      // 检测 npm 包是否存在
      if (!this.getPackagePath(packageName)) {
        this.logger.error(`服务插件 ${packageName} 未安装，请先安装`);
        return;
      }

      // 检测是否包含指定文件
      const packageServicePath = path.resolve(
        this.getPackagePath(packageName),
        './dist/plugin.service.js',
      );

      if (!fs.existsSync(packageServicePath)) {
        this.logger.error(
          `插件 ${packageName} 缺少文件: ${packageServicePath}`,
        );
        return;
      }

      // 动态引入并创建服务
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceModule = require(packageServicePath);
      const serviceSchema = serviceModule.default
        ? serviceModule.default
        : serviceModule;
      if (serviceSchema) {
        const service = this.broker.createService(serviceSchema);
        // this.broker._restartService(service);
        this.logger.log(`插件服务已加载: ${packageName}`);
      }
    } catch (err) {
      this.logger.error(`处理插件 ${plugin} 时出错: ${(err as Error).message}`);
    }
  }

  private getPackagePath(packageName: string): string {
    try {
      return path.dirname(
        require.resolve(`${packageName}/package.json`, {
          paths: [
            path.join(process.env.B6_PLUGIN_DIR, 'node_modules'),
            ...module.paths,
          ],
        }),
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
