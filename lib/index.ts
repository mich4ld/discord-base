import 'reflect-metadata';

export { Service as Command } from 'typedi';
export { Service as Event } from 'typedi';
export { Service } from 'typedi';

export { DiscordBot } from './bot';
export { CommandHandler, EventHandler } from './commands';

export { joinArgs, parseCommand } from './utils';
