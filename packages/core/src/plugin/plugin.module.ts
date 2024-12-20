import { DynamicModule, Logger, Module } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as childProcess from 'child_process';
import { PluginService } from './plugin.service';
import { MoleculerPluginService } from './moleculer.service';
import { MoleculerModule } from '@builder6/moleculer';

const States = {
  STOPPED: 'stopped',
  LOADING: 'loading',
  INSTALLING: 'installing',
  STARTING: 'starting',
  RUNNING: 'running',
  SAFE: 'safe',
  CRASHED: 'crashed',
  STOPPING: 'stopping',
};

@Module({
  imports: [MoleculerModule.forRoot({})],
  providers: [PluginService, MoleculerPluginService],
})
export class PluginModule {
  static readonly logger = new Logger(PluginModule.name);
  public static plugins: Plugin[] = [];

  private readonly logger = new Logger(PluginService.name);
  private static npmrc = process.env.B6_PLUGIN_NPMRC;
  private static install_packages = process.env.B6_PLUGIN_PACKAGES;

  static state: any;
  static targetState: any;

  constructor(private readonly moleculerService: MoleculerPluginService) {}

  static forRootAsync(): DynamicModule {
    return {
      module: PluginModule,
      imports: [],
      providers: [
        {
          provide: 'PLUGINS',
          useFactory: async () => {
            const modules = process.env.B6_PLUGIN_MODULES;
            await this.updateNpmrc();
            await this.installPackages();
            const plugins = [];
            if (modules) {
              for (const module of modules.split(',')) {
                const pluginModule = await this.loadPlugin(module);
                plugins.push({
                  name: module,
                  module: pluginModule,
                });
              }
            }
            this.plugins = plugins;
            return plugins.map((plugin) => plugin.module);
          },
        },
      ],
      exports: ['PLUGINS'],
    };
  }


  onModuleInit() {
    this.moleculerService.loadServices();
  }

  // static forRoot(): DynamicModule {
  //   const modules = process.env.B6_PLUGIN_MODULES;
  //   if (modules) {
  //     for (const module of modules.split(',')) {
  //       const pluginModule = this.loadPlugin(module);
  //       this.plugins.push({
  //         name: module,
  //         module: pluginModule,
  //       });
  //     }
  //   }
  //   return {
  //     module: PluginModule,
  //     imports: [...this.plugins.map((plugin) => plugin.module)],
  //   } as DynamicModule;
  // }

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
            path.join(this.getPluginDir(), 'node_modules'),
            ...module.paths,
          ],
        }),
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static getPluginDir() { 

    const pluginsPath = path.resolve(process.cwd(), 'plugins');
            
    // 检查文件夹是否存在，如果不存在则创建
    if (!fs.existsSync(pluginsPath)) {
      fs.mkdirSync(pluginsPath, { recursive: true });
      console.log(`Plugins folder created at: ${pluginsPath}`);
    }

    return pluginsPath

  }

  static getInstallPackages() {
    // packages 格式为 @builder6/app1@1.0.0,@builder6/app2
    // 转为 格式 { "@builder6/app1": "1.0.0", "@builder6/app2": "latest" }
    if (this.install_packages) {

      const pluginList = this.install_packages.split(',');
      const pluginMap = {};
      pluginList.forEach((plugin) => {
        const match = plugin.match(/^(@[^@]+\/[^@]+|[^@]+)(?:@(.+))?$/);
        if (match) {
          const name = match[1]; // 包名
          const version = match[2] || 'latest'; // 版本号（默认 latest）
          pluginMap[name] = version;
        }
      });
      return pluginMap;
    }
    return {};
  }

  static async updateNpmrc() {
    const npmrcPath = path.join(this.getPluginDir(), '.npmrc');
    if (this.npmrc) {
      try {
        fs.writeFileSync(npmrcPath, this.npmrc);
      } catch (error) {
        this.state = States.STOPPED;
        this.logger.log('Unable to write .npmrc file');
        throw error;
      }
    } else {
      if (fs.existsSync(npmrcPath)) {
        try {
          fs.unlinkSync(npmrcPath);
        } catch (error) {
          this.state = States.STOPPED;
          this.logger.log('Unable to remove old .npmrc file');
          throw error;
        }
      }
    }
  }
  
  static async installPackages() {
    const pkgFilePath = path.join(this.getPluginDir(), 'package.json');
    if (!fs.existsSync(pkgFilePath)) {
      // 写入一个空的 package.json
      fs.writeFileSync(
        pkgFilePath,
        JSON.stringify(
          { name: 'b6-plugins', version: '0.0.0', dependencies: {} },
          null,
          2,
        ),
      );
    }
    const packageContent = fs.readFileSync(pkgFilePath, { encoding: 'utf8' });
    const pkg = JSON.parse(packageContent);
    const existingDependencies = pkg.dependencies || {};
    const wantedDependencies = this.getInstallPackages();

    const existingModules = Object.keys(existingDependencies);
    const wantedModules = Object.keys(wantedDependencies);

    this.logger.log(`Plugin dependencies: ${existingModules}`, );

    let changed = false;
    if (existingModules.length !== wantedModules.length) {
      changed = true;
    } else {
      existingModules.sort();
      wantedModules.sort();
      for (let i = 0; i < existingModules.length; i++) {
        if (existingModules[i] !== wantedModules[i]) {
          changed = true;
          break;
        }
        if (
          existingDependencies[existingModules[i]] !==
          wantedDependencies[wantedModules[i]]
        ) {
          changed = true;
          break;
        }
      }
    }

    if (changed) {
      this.state = States.INSTALLING;
      this.logger.warn(`Install plugin dependencies: ${this.install_packages}`);
      pkg.dependencies = wantedDependencies;
      fs.writeFileSync(pkgFilePath, JSON.stringify(pkg, null, 2));
      const npmEnv = Object.assign({}, process.env);
      const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      return new Promise<void>((resolve, reject) => {
        const child = childProcess.spawn(
          npmCommand,
          [
            'install',
            '--omit=dev',
            '--no-audit',
            '--no-update-notifier',
            '--no-fund',
          ],
          {
            windowsHide: true,
            cwd: path.join(this.getPluginDir()),
            env: npmEnv,
            shell: true,
          },
        );
        child.stdout.on('data', (data) => {
          this.logger.log('[npm] ' + data);
        });
        child.stderr.on('data', (data) => {
          this.logger.log('[npm] ' + data);
        });
        child.on('error', (err) => {
          this.logger.log('[npm] ' + err.toString());
        });
        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(
              new Error(
                `Failed to install project dependencies ret code: ${code} signal ${child.signalCode}`,
              ),
            );
          }
        });
      }).catch((err) => {
        // Revert the package file to the previous content. That ensures
        // it will try to install again the next time it attempts to run
        fs.writeFileSync(pkgFilePath, packageContent);
        throw err;
      });
    }
  }
}

interface Plugin {
  name: string;
  module: DynamicModule;
}
