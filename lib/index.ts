import 'reflect-metadata';

export { Service, Service as Handler } from 'typedi';

export { DiscordBot } from './bot';
export { CommandHandler, EventHandler } from './commands';

export { joinArgs, parseCommand } from './utils';

//export * from 'discord.js';