"use strict";
import * as _ from "lodash";

import config from './env.config';

/**
 * Steedos ServiceBroker configuration file
 *
 * More info about options:
 * https://moleculer.services/docs/0.14/configuration.html
 */

const defaultConfig = {
    namespace: "steedos",
    nodeID: null,
    metadata: {},

    logger: [
        {
            type: "Console",
            options: {
                colors: true,
                moduleColors: false,
                formatter: "full",
                objectPrinter: null,
                autoPadding: false
            }
        }
    ],
    logLevel: process.env.B6_LOG_LEVEL || "warn",

    transporter: process.env.TRANSPORTER,

    cacher: process.env.CACHER,

    serializer: "JSON",

    requestTimeout: 0,

    retryPolicy: {
        enabled: false,
    },

    maxCallLevel: 100,

    heartbeatInterval: 10,
    heartbeatTimeout: 30,

    contextParamsCloning: false,

    tracking: {
        enabled: false,
    },

    disableBalancer: false,

    registry: {
        strategy: "RoundRobin",
        preferLocal: true
    },

    circuitBreaker: {
        enabled: false,
        threshold: 0.5,
        minRequestCount: 20,
        windowTime: 60,
        halfOpenTime: 10000,
        check: (err: any) => err && err.code >= 500
    },

    bulkhead: {
        enabled: false,
        concurrency: 10,
        maxQueueSize: 100
    },

    validator: true,

    errorHandler: null,

    metrics: {
        enabled: false,
    },

    tracing: {
        enabled: false,
    },

    middlewares: [],

    replCommands: null,

    skipProcessEventRegistration: true,

    created(broker: any) {
      
    },

    started(broker: any) {
        // Custom logic after broker starts
    },

    stopped(broker: any) {
        // Custom logic after broker stops
    }
};

const envConfig = config();

console.log('Loading env config', envConfig);

export default {
    ...defaultConfig,
    ...envConfig
}