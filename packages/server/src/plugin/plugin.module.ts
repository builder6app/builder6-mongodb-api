import { DynamicModule, Logger, Module } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PluginService } from './plugin.service';

@Module({
  providers: [PluginService],
})
export class PluginModule {
  static readonly logger = new Logger(PluginModule.name);
  public static plugins: Plugin[] = [];

  static forRoot(modules): DynamicModule {
    if (modules) {
      for (const module of modules.split(',')) {
        const pluginModule = this.loadPlugin(module);
        this.plugins.push({
          name: module,
          module: pluginModule,
        });
      }
    }
    console.log('this.plugins', this.plugins);
    return {
      module: PluginModule,
      imports: [...this.plugins.map((plugin) => plugin.module)],
    } as DynamicModule;
  }

  static loadPlugin(packageName: string) {
    // 检测是否包含指定文件
    const packageModulePath = path.resolve(
      this.getPackagePath(packageName),
      './dist/plugin.module.js',
    );

    if (!fs.existsSync(packageModulePath)) {
      this.logger.error(`插件 ${packageName} 缺少文件: ${packageModulePath}`);
      return;
    }

    // 动态引入并创建服务
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PluginModule = require(packageModulePath);

    return PluginModule.default;
  }

  static isPackageInstalled(packageName: string): boolean {
    try {
      require.resolve(`${packageName}/package.json`);
      return true;
    } catch {
      return false;
    }
  }

  static getPackagePath(packageName: string): string {
    try {
      return path.dirname(require.resolve(`${packageName}/package.json`));
    } catch {
      throw new Error(`无法解析插件路径: ${packageName}`);
    }
  }
}

interface Plugin {
  name: string;
  module: DynamicModule;
}
