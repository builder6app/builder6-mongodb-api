'use strict';
import * as _ from 'lodash';

/**
 * Steedos ServiceBroker configuration file
 *
 * More info about options:
 * https://moleculer.services/docs/0.14/configuration.html
 */

export default {
  namespace: 'steedos',
  nodeID: null,
  metadata: {},

  logger: {
    type: 'Console',
    options: {
      // Logging level
      level: 'info',
      // Using colors on the output
      colors: true,
      // Print module names with different colors (like docker-compose for containers)
      moduleColors: false,
      // Line formatter. It can be "json", "short", "simple", "full", a `Function` or a template string like "{timestamp} {level} {nodeID}/{mod}: {msg}"
      formatter: '[MO] {timestamp} {level} [{mod}] {msg}',
      // Custom object printer. If not defined, it uses the `util.inspect` method.
      objectPrinter: null,
      // Auto-padding the module name in order to messages begin at the same column.
      autoPadding: false,
    },
  },

  transporter: process.env.B6_TRANSPORTER,

  cacher: process.env.B6_CACHER,
  
  serializer: 'JSON',

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
    strategy: 'RoundRobin',
    preferLocal: true,
  },

  circuitBreaker: {
    enabled: false,
    threshold: 0.5,
    minRequestCount: 20,
    windowTime: 60,
    halfOpenTime: 10000,
    check: (err: any) => err && err.code >= 500,
  },

  bulkhead: {
    enabled: false,
    concurrency: 10,
    maxQueueSize: 100,
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

  created(broker: any) {},

  started(broker: any) {
    // Custom logic after broker starts
  },

  stopped(broker: any) {
    // Custom logic after broker stops
  },
};
