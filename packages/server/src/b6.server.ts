#!/usr/bin/env node

/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import { Logger } from '@nestjs/common';

import * as project from '../package.json';
import { getEnvConfigs } from '@builder6/core';

const childProcess = require('child_process');


var semver = require('semver');
if (!semver.satisfies(process.version, '>=14.0.0')) {
  console.log('Unsupported version of Node.js:', process.version);
  console.log('Node-RED requires Node.js v18 or later');
  process.exit(1);
}

var util = require('util');
var nopt = require('nopt');
var path = require('path');
const os = require('os');
import * as fs from 'fs-extra';

var knownOpts = {
  help: Boolean,
  port: Number,
  config: [path],
  title: String,
  userDir: [path],
  npmPackages: String,
  verbose: Boolean,
  safe: Boolean,
  version: Boolean,
  define: [String, Array],
};
var shortHands = {
  '?': ['--help'],
  p: ['--port'],
  s: ['--config'],
  // As we want to reserve -t for now, adding a shorthand to help so it
  // doesn't get treated as --title
  t: ['--help'],
  u: ['--userDir'],
  n: ['--npmPackages'],
  v: ['--verbose'],
  D: ['--define'],
};
nopt.invalidHandler = function (k, v, t) {
  // TODO: console.log(k,v,t);
};

var parsedArgs = nopt(knownOpts, shortHands, process.argv, 2);

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

class B6Server {
  userDir: string = process.env.B6_PLUGIN_DIR;
  configFile: string;
  config: any;

  state: any;
  targetState: any;
  startTimes: any[];
  runDurations: any[];
  exitCallback: null;
  healthPoll: null;
  resourcePoll: null;
  parsedArgs: any;
  cpuAuditLogged: number;
  memoryAuditLogged: number;
  private readonly logger = new Logger(B6Server.name);
  public app: any;

  constructor(parsedArgs) {
    this.state = States.STOPPED;
    this.parsedArgs = parsedArgs || {};
    // Assume we want to start NR unless told otherwise via loadSettings
    this.targetState = States.RUNNING;

    this.config = {};

    // Array of times and run durations for monitoring boot loops
    this.startTimes = [];
    this.runDurations = [];

    // A callback function that will be set if the launcher is waiting
    // for Node-RED to exit
    this.exitCallback = null;

    this.healthPoll = null;
    this.resourcePoll = null;

    this.cpuAuditLogged = 0;
    this.memoryAuditLogged = 0;
  }

  async loadConfig() {

    this.config = {
      ...getEnvConfigs(),
    };

    if (this.parsedArgs.help) {
      console.log('B6 Server v' + project.version);
      console.log(
        'Usage: b6server [-v] [-?] [--config b6.config.js] [--userDir DIR]',
      );
      console.log(
        '                [--port PORT] [--title TITLE] [--safe] [services]',
      );
      console.log('');
      console.log('Options:');
      console.log('  -p, --port           port to listen on');
      console.log('  -s, --config         specified config file');
      console.log('  -n, --npmPackages    install specified npm packages');
      console.log('  -u, --userDir        use specified user directory');
      console.log('  -v, --verbose        enable verbose output');
      console.log('      --safe           enable safe mode');
      console.log('      --version        show version information');
      console.log('  -?, --help           show this help');
      console.log('');
      console.log('Documentation can be found at https://builder6.com');
      process.exit();
    }

    console.log('Builder6 Server v' + project.version);
    console.log('Node.js ' + process.version);
    console.log(
      os.type() +
        ' ' +
        os.release() +
        ' ' +
        os.arch() +
        ' ' +
        os.endianness(),
    );

    // if (this.parsedArgs.config) {
    //   // User-specified config file
    //   this.configFile = this.parsedArgs.config;
    // } else if (
    //   this.parsedArgs.userDir &&
    //   fs.existsSync(path.join(this.parsedArgs.userDir, 'b6.config.js'))
    // ) {
    //   // User-specified userDir that contains a b6.config.js
    //   this.configFile = path.join(this.parsedArgs.userDir, 'b6.config.js');
    // } else {
    //   if (fs.existsSync(path.join(process.env.B6_PLUGIN_HOME, 'b6.config.json'))) {
    //     // B6_HOME contains user data - use its b6.config.js
    //     this.configFile = path.join(process.env.B6_HOME, 'b6.config.js');
    //   } else {
    //     if (
    //       !this.parsedArgs.userDir &&
    //       !(process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH)
    //     ) {
    //       console.log(
    //         'Could not find user directory. Ensure $HOME is set for the current user, or use --userDir option',
    //       );
    //       process.exit(1);
    //     }
    //     this.userDir =
    //       this.parsedArgs.userDir ||
    //       path.join(
    //         process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH,
    //         '.b6',
    //       );
    //     var userconfigFile = path.join(this.userDir, 'b6.config.js');
    //     if (fs.existsSync(userconfigFile)) {
    //       // $HOME/.node-red/b6.config.js exists
    //       this.configFile = userconfigFile;
    //     } else {
    //       var defaultconfig = path.join(__dirname, 'b6.config.js');
    //       var configStat = fs.statSync(defaultconfig);
    //       if (configStat.mtime.getTime() <= configStat.ctime.getTime()) {
    //         // Default config file has not been modified - safe to copy
    //         fs.copySync(defaultconfig, userconfigFile);
    //         this.configFile = userconfigFile;
    //       } else {
    //         // Use default b6.config.js as it has been modified
    //         this.configFile = defaultconfig;
    //       }
    //     }
    //   }
    // }

    // try {
    //   const configJs = require(this.configFile);
    //   this.config = {
    //     ...configJs,
    //     ...getEnvConfigs(),
    //   };
    //   console.log('configJs', configJs);
    //   this.userDir = path.dirname(this.configFile);
    //   this.config.configFile = this.configFile;
    // } catch (err) {
    //   console.log('Error loading config file: ' + this.configFile);
    //   if (err.code == 'MODULE_NOT_FOUND') {
    //     if (err.toString().indexOf(this.configFile) === -1) {
    //       console.log(err.toString());
    //     }
    //   } else {
    //     console.log(err);
    //   }
    //   process.exit(1);
    // }

    if (this.parsedArgs.verbose) {
      this.config.verbose = true;
    }
    if (
      this.parsedArgs.safe ||
      (process.env.B6_ENABLE_SAFE_MODE &&
        !/^false$/i.test(process.env.B6_ENABLE_SAFE_MODE))
    ) {
      this.config.safeMode = true;
    }

    if (this.parsedArgs.port !== undefined) {
      this.config.port = this.parsedArgs.port;
    } else {
      if (this.config.port === undefined) {
        this.config.port = 5100;
      }
    }

    this.config.plugin = this.config.plugin || {
      dir: process.env.B6_PLUGIN_DIR,
    };

    if (this.parsedArgs.npmPackages !== undefined) {
      this.config.plugin.packages = this.parsedArgs.npmPackages;
    }

    if (this.parsedArgs.argv.remain.length > 0) {
      this.config.plugin.services = this.parsedArgs.argv.remain[0];
    }

    this.logger.log('Loaded config', this.config);
  }

  async startApp() {

    const ExpressApplication = require('./app.express');
    this.app = await ExpressApplication.default();
    await this.app.listen(this.config.port);
  }

  async bootstrap() {
    await this.startApp();
  }
}

const server = new B6Server(parsedArgs);
server.bootstrap();
