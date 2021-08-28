import { Intents } from 'discord.js';

export interface DiscordConfig {
    token?: string;
    activity?: string;
    prefix?: string;
    intents?: number[];
}

export const defaultConfig: Required<DiscordConfig> = {
    activity: 'Bot',
    token: process.env.DISCORD_TOKEN || '',
    prefix: '!',
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
}
