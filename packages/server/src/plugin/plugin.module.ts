import { DynamicModule, Logger, Module } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PluginService } from './plugin.service';
import getConfig from '../app.config';
import { MoleculerPluginService } from './moleculer.service';
import { MoleculerModule } from '@builder6/moleculer';

@Module({
  imports: [MoleculerModule.forRoot({})],
  providers: [PluginService, MoleculerPluginService],
})
export class PluginModule {
  static readonly logger = new Logger(PluginModule.name);
  static config = getConfig();
  public static plugins: Plugin[] = [];

  static forRoot(): DynamicModule {
    const modules = this.config.plugin.modules;
    if (modules) {
      for (const module of modules.split(',')) {
        const pluginModule = this.loadPlugin(module);
        this.plugins.push({
          name: module,
          module: pluginModule,
        });
      }
    }
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
      this.logger.error(
        `Nestjs 插件 ${packageName} 缺少文件: ${packageModulePath}`,
      );
      return;
    }

    // 动态引入并创建服务
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.logger.log(`加载 Nestjs 插件： ${packageName} ...`);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PluginModule = require(packageModulePath);

    return PluginModule.default;
  }

  static getPackagePath(packageName: string): string {
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

interface Plugin {
  name: string;
  module: DynamicModule;
}
