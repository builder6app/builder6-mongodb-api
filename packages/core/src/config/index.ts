
import defaultConfigs from './default.config';
import moleculerConfigs from './moleculer.config';
import envConfigs from './env.config';
import getProjectConfigs from './project.config';

export const projectConfigs = getProjectConfigs(process.cwd());

export async function getDbConfigs() {
  return {}
}

export function getEnvConfigs() {
  return envConfigs
}

export function getMoleculerConfigs() {
  const { moleculer } = envConfigs;
  return {
    ...moleculerConfigs,
    ...projectConfigs,
    ...moleculer,
  }
}

export function getConfigs() {
  return {
    ...defaultConfigs,
    ...projectConfigs,
    ...envConfigs,
  }
}

export const configs = getConfigs();
