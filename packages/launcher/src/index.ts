#!/usr/bin/env node

const commandLineArgs = require('command-line-args')

const cmdLineOptions = [
    { name: 'port', alias: 'p', type: Number },
    { name: 'forgeURL', type: String },
    { name: 'team', alias: 't', type: String },
    { name: 'project', type: String },
    { name: 'token', type: String },
    { name: 'buffer', alias: 'b', type: Number },
    { name: 'nodeRedPath', alias: 'n', type: String },
    { name: 'credentialSecret', type: String },
    { name: 'no-tcp-in', alias: 'T', type: Boolean },
    { name: 'no-udp-in', alias: 'U', type: Boolean }
]

const options = commandLineArgs(cmdLineOptions)

console.log(options);