import * as dotenvFlow from 'dotenv-flow';
import * as path from 'path';
import defaultConfig from './default.config';
import moleculerConfig from './moleculer.config';

dotenvFlow.config({
  path: process.cwd(),
  silent: true,
});

/* 兼容 Steedos 环境变量 */
process.env.B6_ROOT_URL = process.env.B6_ROOT_URL || process.env.ROOT_URL;
process.env.B6_MONGO_URL = process.env.B6_MONGO_URL || process.env.MONGO_URL;
process.env.B6_TRANSPORTER =
  process.env.B6_TRANSPORTER ||
  process.env.STEEDOS_TRANSPORTER ||
  process.env.TRANSPORTER;

process.env.B6_HOME = process.env.B6_HOME || process.cwd();
process.env.B6_PLUGIN_DIR =
  process.env.B6_PLUGIN_DIR || path.join(process.cwd(), 'plugins');

/**
 * 将以指定前缀开头的环境变量解析为 JSON 对象
 * @param {Object} env - 环境变量对象（通常是 process.env）
 * @param {Array<string>} prefixes - 需要解析的前缀数组
 * @returns {Object} - 转换后的 JSON 对象
 */
function parseEnvToJSON(env, prefixes) {
  const result = {};

  Object.keys(env).forEach((key) => {
    // 检查是否以指定前缀开头
    const hasValidPrefix = prefixes.some((prefix) => key.startsWith(prefix));
    if (!hasValidPrefix) {
      return; // 跳过非目标前缀的变量
    }

    // 去除前缀并转为小写
    const strippedKey = key
      .replace(new RegExp(`^(${prefixes.join('|')})`), '')
      .toLowerCase();
    const keys = strippedKey.split('_'); // 分割层级
    let current = result;
    keys.forEach((k, index) => {
      if (index === keys.length - 1) {
        // 最后一层，赋值
        const value = env[key];

        // 检查是否为布尔值
        if (value.toLowerCase() === 'true') {
          current[k] = true;
        } else if (value.toLowerCase() === 'false') {
          current[k] = false;
        } else if (!isNaN(value)) {
          // 如果是数字
          current[k] = Number(value);
        } else {
          // 默认保留为字符串
          current[k] = value;
        }
      } else {
        // 如果层级不存在，初始化为对象
        current[k] = current[k] || {};
        current = current[k];
      }
    });
  });

  return result;
}

export function getEnvConfigs() {
  const env = parseEnvToJSON(process.env, ['STEEDOS_', 'B6_']) as any;
  return env;
}


export async function getDbConfigs() {
  return {}
}

export function getFileConfigs(){
  return {}
}

export function getConfigs() {
  const env = getEnvConfigs();
  const file = getFileConfigs();
  return {
    ...defaultConfig,
    ...env,
    ...file,
  }
}

export function getMoleculerConfigs() {
  const env = getEnvConfigs();
  const file = getFileConfigs();
  return {
    ...moleculerConfig,
    ...env,
    ...file
  }
}