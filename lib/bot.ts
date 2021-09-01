import { Client, ClientEvents, Message } from 'discord.js';
import { parseCommand } from "./utils";
import { buildConfig, DEFAULT_INTENTS, DiscordConfig, InputDiscordConfig } from "./config";
import { CommandHandler, EventHandler, executeCommandHandler, executeEventHandler, getEventHandler } from './handlers';
import { BaseLogger, getLogger } from './logger';
import { globals } from './globals';
import { DiscordClient } from './client';

interface Command {
    handler: typeof CommandHandler;
    roles?: string[];
}

type ClientSetup = (client: Client) => any;

export class DiscordBot {
    private logger: BaseLogger;
    private config: DiscordConfig;
    private client: Client<boolean>;
    private clientConfigurator: DiscordClient;
    private events: Map<typeof EventHandler, any> = new Map();
    // command sets:
    private commands: Map<string, Command> = new Map();
    private genericHandler?: typeof CommandHandler;
    private messageHandler?: typeof EventHandler;

    constructor(config: InputDiscordConfig = {}) {
        const { appConfig, clientConfig } = buildConfig(config);
        this.config = appConfig;
        globals.logger = this.config.logger;
        this.logger = getLogger(this.config.logger);
        this.logger.log('Creating client...');
        this.client = new Client({
            ...clientConfig,
            intents: clientConfig.intents || DEFAULT_INTENTS,
        });
        this.clientConfigurator = new DiscordClient(this.client);
        this.bootstrapBot();
    }

    addEvent(event: keyof ClientEvents, handler: typeof EventHandler) {
        const registeredHandler = this.events.get(handler);
        if (!registeredHandler) {
            const handleFunc = getEventHandler(handler);
            this.events.set(handler, handleFunc);
            this.client.on(event, handleFunc as any);
            return this;
        }
        
        this.client.on(event, registeredHandler);
        return this;
    }

    removeEvent(event: keyof ClientEvents, handler: typeof EventHandler) {
        const registeredHandler = this.events.get(handler);
        if (!registeredHandler) {
            this.logger.warn(`Registered handler for "${event}" not found`);
            return this;
        }

        this.client.removeListener(event, registeredHandler);
        return this;
    }

    removeAllEvents(event: keyof ClientEvents) {
        if (event === 'messageCreate') {
            this.logger.warn('Removing "messageCreate" event is not allowed - ignoring method...');
            return this;
        }

        this.client.removeAllListeners(event);
        this.logger.info(`Removed all handlers from event: "${event}"`);
        return this;
    }

    addCommandForRoles(command: string, handler: typeof CommandHandler, roles: string[]) {
        this.commands.set(command, { roles, handler });
        return this;
    }

    addCommand(command: string, handler: typeof CommandHandler) {
        this.commands.set(command, { handler });
        return this;
    }

    addAnyMessageHandler(handler: typeof EventHandler) {
        this.messageHandler = handler;
        return this;
    }


    addGenericHandler(handler: typeof CommandHandler) {
        this.genericHandler = handler;
        return this;
    }

    removeGenericHandler() {
        this.genericHandler = undefined;
        return this;
    }

    removeAnyMessageHandler() {
        this.messageHandler = undefined;
        return this;
    }

    removeCommand(command: string) {
        const isRemoved = this.commands.delete(command);
        if (isRemoved) {
            this.logger.notice(`Command ${this.config.prefix}${command} has been removed`);
        }

        return this;
    }

    clearCommands() {
        this.commands.clear();
        this.logger.notice(`All commands removed`);
        return this;
    }

    destroy() {
        this.client.destroy();
        this.logger.info(`Client destroyed`);
    }

    setupClient(method: ClientSetup) {
        method(this.client);
        return this;
    }

    private async handleCommand(msg: Message, args: string[], commandName: string) {
        const command = this.commands.get(commandName);
        if (!command) {
            if (this.genericHandler) {
                await executeCommandHandler(this.genericHandler, msg, args);
            }

            return;
        }

        if (command.roles && msg.member) {
            const hasPermission = msg.member.roles.cache.some(role => command.roles!.includes(role.name));
            if (!hasPermission) {
                return;
            }
        }

        await executeCommandHandler(command.handler, msg, args);
    }

    private onMessageCreate = async (msg: Message) => {
        if (msg.author.bot && this.config.ignoreBots) {
            return;
        }

        const parsedCommand = parseCommand(msg.content, this.config.prefix);
        if(parsedCommand) {
            const { commandName, args } = parsedCommand;
            await this.handleCommand(msg, args, commandName);
            return;
        }

        if (this.messageHandler) {
            await executeEventHandler(this.messageHandler, msg);
        }
    }

    private onReady = async () => {
        await this.clientConfigurator.configureClient(this.config);
        this.logger.info(`Logged in as ${this.client.user?.tag}!`);
    }

    private onError = (err: Error) => {
        this.logger.error(` ${err.message}`)
    }

    private bootstrapBot() {
        this.client
            .on("ready", this.onReady)
            .on("messageCreate", this.onMessageCreate)
            .on('error', this.onError)

        this.client.login(this.config.token);
    }
}
