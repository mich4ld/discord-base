import { ActivityOptions, ClientOptions, Intents } from 'discord.js';
import { BaseLogger, Logger } from './logger';

export interface DiscordConfig {
    token: string;
    activity?: ActivityOptions | string;
    name?: string;
    prefix: string;
    avatarURL?: string;
    ignoreBots?: boolean;
    logger: typeof BaseLogger,
}

export const DEFAULT_INTENTS = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES];
export const DEFAULT_PREFIX = '!';

export type InputDiscordConfig = Partial<ClientOptions> & Partial<DiscordConfig>;

export function buildConfig(config: InputDiscordConfig) {
    let token: string | undefined;
    if (process.env.DISCORD_TOKEN) {
        token = process.env.DISCORD_TOKEN;
    }

    if (config.token) {
        token = config.token;
    }

    if (!token) {
        throw Error('Error: Token is required!');
    }

    const { activity, prefix, name, avatarURL, ignoreBots, ...clientConfig } = config;

    const appConfig: DiscordConfig = {
        token,
        activity: activity,
        prefix: prefix || DEFAULT_PREFIX,
        name: name,
        avatarURL: avatarURL,
        ignoreBots: ignoreBots || true,
        logger: config.logger || Logger,
    }

    return {
        appConfig,
        clientConfig
    }
}