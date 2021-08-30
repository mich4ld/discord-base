import 'reflect-metadata';

export { Service, Service as Handler } from 'typedi';

export { DiscordBot } from './bot';
export { CommandHandler, EventHandler } from './handlers';

export { joinArgs, parseCommand } from './utils';

//export * from 'discord.js';