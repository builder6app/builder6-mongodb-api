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
import ExpressApplication from './app.express';
import * as project from '../package.json';


var semver = require('semver');
if (!semver.satisfies(process.version, ">=14.0.0")) {
    console.log("Unsupported version of Node.js:", process.version);
    console.log("Node-RED requires Node.js v18 or later");
    process.exit(1)
}

var util = require("util");
var nopt = require("nopt");
var path = require("path");
const os = require("os")
import * as fs from 'fs-extra';


var config;
var configFile;
var plugins;

var knownOpts = {
    "help": Boolean,
    "port": Number,
    "config": [path],
    "title": String,
    "userDir": [path],
    "verbose": Boolean,
    "safe": Boolean,
    "version": Boolean,
    "define": [String, Array]
};
var shortHands = {
    "?":["--help"],
    "p":["--port"],
    "s":["--config"],
    // As we want to reserve -t for now, adding a shorthand to help so it
    // doesn't get treated as --title
    "t":["--help"],
    "u":["--userDir"],
    "v":["--verbose"],
    "D":["--define"]
};
nopt.invalidHandler = function(k,v,t) {
    // TODO: console.log(k,v,t);
}

var parsedArgs = nopt(knownOpts,shortHands,process.argv,2)

if (parsedArgs.help) {
    console.log("Builder6 Server v" + project.version);
    console.log("Usage: b6server [-v] [-?] [--config b6.config.js] [--userDir DIR]");
    console.log("                [--port PORT] [--title TITLE] [--safe] [plugins]");
    console.log("");
    console.log("Options:");
    console.log("  -p, --port     PORT  port to listen on");
    console.log("  -s, --config FILE  use specified config file");
    console.log("  -u, --userDir  DIR   use specified user directory");
    console.log("  -v, --verbose        enable verbose output");
    console.log("      --safe           enable safe mode");
    console.log("      --version        show version information");
    console.log("  -?, --help           show this help");
    console.log("");
    console.log("Documentation can be found at https://builder6.com");
    process.exit();
}

if (parsedArgs.version) {
    console.log("Builder6 Server v"+project.version)
    console.log("Node.js "+process.version)
    console.log(os.type()+" "+os.release()+" "+os.arch()+" "+os.endianness())
    process.exit()
}

if (parsedArgs.argv.remain.length > 0) {
    plugins = parsedArgs.argv.remain[0];
}

process.env.B6_HOME = process.env.B6_HOME || __dirname;

if (parsedArgs.config) {
    // User-specified config file
    configFile = parsedArgs.config;
} else if (parsedArgs.userDir && fs.existsSync(path.join(parsedArgs.userDir,"b6.config.js"))) {
    // User-specified userDir that contains a b6.config.js
    configFile = path.join(parsedArgs.userDir,"b6.config.js");
} else {
    if (fs.existsSync(path.join(process.env.B6_HOME,"b6.config.js"))) {
        // B6_HOME contains user data - use its b6.config.js
        configFile = path.join(process.env.B6_HOME,"b6.config.js");
    } else {
        if (!parsedArgs.userDir && !(process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH)) {
            console.log("Could not find user directory. Ensure $HOME is set for the current user, or use --userDir option")
            process.exit(1)
        }
        var userDir = parsedArgs.userDir || path.join(process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH,".node-red");
        var userconfigFile = path.join(userDir,"b6.config.js");
        if (fs.existsSync(userconfigFile)) {
            // $HOME/.node-red/b6.config.js exists
            configFile = userconfigFile;
        } else {
            var defaultconfig = path.join(__dirname,"b6.config.js");
            var configStat = fs.statSync(defaultconfig);
            if (configStat.mtime.getTime() <= configStat.ctime.getTime()) {
                // Default config file has not been modified - safe to copy
                fs.copySync(defaultconfig,userconfigFile);
                configFile = userconfigFile;
            } else {
                // Use default b6.config.js as it has been modified
                configFile = defaultconfig;
            }
        }
    }
}

try {
    var config = require(configFile);
    config.configFile = configFile;
} catch(err) {
    console.log("Error loading config file: "+configFile)
    if (err.code == 'MODULE_NOT_FOUND') {
        if (err.toString().indexOf(configFile) === -1) {
            console.log(err.toString());
        }
    } else {
        console.log(err);
    }
    process.exit(1);
}

if (parsedArgs.verbose) {
    config.verbose = true;
}
if (parsedArgs.safe || (process.env.B6_ENABLE_SAFE_MODE && !/^false$/i.test(process.env.B6_ENABLE_SAFE_MODE) )) {
    config.safeMode = true;
}

if (parsedArgs.port !== undefined){
  config.port = parsedArgs.port;
} else {
  if (config.port === undefined){
    config.port = 5100;
  }
}


global.B6 = global.B6? global.B6: {};
global.B6.config = config;

export async function bootstrap() {
  const app = await ExpressApplication();
  
  await app.listen(config.port);
}
bootstrap();
  
