import { ActivityOptions, Intents } from 'discord.js';

export interface DiscordConfig {
    token: string;
    activity?: ActivityOptions | string;
    name?: string;
    prefix: string;
    intents: number[];
}

export const DEFAULT_INTENTS = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES];
export const DEFAULT_PREFIX = '!';

export function buildConfig(config: Partial<DiscordConfig>): DiscordConfig {
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

    const defaultConfig = {
        token,
        activity: config.activity,
        prefix: config.prefix || DEFAULT_PREFIX,
        intents: config.intents || DEFAULT_INTENTS,
        name: config.name,
    }

    return defaultConfig
}