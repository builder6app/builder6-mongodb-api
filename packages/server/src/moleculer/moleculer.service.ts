import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceBroker } from 'moleculer';
import * as fs from "fs";
import * as path from "path";

import moleculerConfig from './moleculer.config';

@Injectable()
export class MoleculerService {
  private broker;
  constructor(private configService: ConfigService) {
    const transporter = this.configService.get("transporter");
    if (!transporter) {
      console.error("B6_TRANSPORTER env is required.");
      return;
    }
    this.broker = new ServiceBroker({
      ...moleculerConfig,
    });
    this.loadPlugins();
    this.broker.start();
  }

  async loadPlugins() {
    // @builder6/plugin-tables@0.5.6,@builder6/plugin-pages@0.5.1,
    const plugins = this.configService.get("plugin.packages");
    if (plugins) {
      for (const plugin of plugins.split(',')) {
        // 解析 plugin npm 名称和 版本号。例如： @builder6/plugin-tables@0.5.6
        // 检测 npm 包是否存在
        // 检测 npm 包中是否包含 './dist/package.service.ts'
        // 引入此文件，并创建包服务
        await this.startPlugin(plugin);
      }
    }
  }

  async startPlugin(plugin) {
    try {
      // 解析插件名称和版本号
      const match = plugin.match(/^(.*?)(?:@([\d.]+))?$/);
      if (!match) {
        console.warn(`插件格式无效: ${plugin}`);
        return;
      }

      const [, packageName, version] = match;
      console.log(`解析插件: 名称=${packageName}, 版本=${version}`);

      // 检测 npm 包是否存在
      if (!this.isPackageInstalled(packageName)) {
        console.error(`插件 ${packageName} 未安装，请先安装`);
        return;
      }

      // 检测是否包含指定文件
      const packageServicePath = path.resolve(
        this.getPackagePath(packageName),
        "./dist/package.service.js"
      );

      if (!fs.existsSync(packageServicePath)) {
        console.error(`插件 ${packageName} 缺少文件: ${packageServicePath}`);
        return;
      }

      // 动态引入并创建服务
      const serviceModule = await import(packageServicePath);
      if (serviceModule.default) {
        this.broker.createService(serviceModule.default);
        console.log(`服务已创建: ${packageName}`, serviceModule.default);
      } else {
        console.warn(`插件 ${packageName} 不包含默认导出`);
      }
    } catch (err) {
      console.error(`处理插件 ${plugin} 时出错: ${(err as Error).message}`);
    }
  }

  private isPackageInstalled(packageName: string): boolean {
    try {
      require.resolve(`${packageName}/package.json`);
      return true;
    } catch {
      return false;
    }
  }

  private getPackagePath(packageName: string): string {
    try {
      return path.dirname(require.resolve(`${packageName}/package.json`));
    } catch {
      throw new Error(`无法解析插件路径: ${packageName}`);
    }
  }
}
