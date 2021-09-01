import { Client, ClientEvents, Message } from 'discord.js';
import { buildConfig, DEFAULT_INTENTS, DiscordConfig, InputDiscordConfig } from "./config";
import { CommandHandler, EventHandler } from './handlers';
import { BaseLogger, getLogger } from './logger';
import { globals } from './globals';
import { DiscordClient } from './client';
import { Commands } from './commands';
import { Events } from './events';

type ClientSetup = (client: Client) => any;

export class DiscordBot {
    private logger: BaseLogger;
    private config: DiscordConfig;

    private client: Client<boolean>;
    private clientConfigurator: DiscordClient;
    private commands: Commands;
    private events: Events;
    
    constructor(config: InputDiscordConfig = {}) {
        // init config:
        const { appConfig, clientConfig } = buildConfig(config);
        this.config = appConfig;
        // configure logger:
        globals.logger = this.config.logger;
        this.logger = getLogger(this.config.logger);
        // configuring client
        this.client = new Client({
            ...clientConfig,
            intents: clientConfig.intents || DEFAULT_INTENTS,
        });
        this.clientConfigurator = new DiscordClient(this.client);
        // init handlers and listeners:
        this.commands = new Commands(this.config);
        this.events = new Events(this.client);
        this.bootstrapBot();
    }

    private onMessageCreate = async (msg: Message) => {
        const commandParsed = await this.commands.parseMessage(msg);
        if (!commandParsed) {
            this.events.runMessageHandler(msg);
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

    // JUST AS API:
    addEvent(event: keyof ClientEvents, handler: typeof EventHandler) {
        this.events.addEvent(event, handler);
        return this;
    }

    removeEvent(event: keyof ClientEvents, handler: typeof EventHandler) {
        this.events.removeEvent(event, handler);
        return this;
    }

    removeAllEvents(event: keyof ClientEvents) {
        this.events.removeAllEvents(event);
        return this;
    }

    addCommandForRoles(command: string, handler: typeof CommandHandler, roles: string[]) {
        this.commands.addCommandForRoles(command, handler, roles);
        return this;
    }

    addCommand(command: string, handler: typeof CommandHandler) {
        this.commands.addCommand(command, handler);
        return this;
    }

    removeCommand(command: string) {
        this.commands.removeCommand(command);
        return this;
    }

    clearCommands() {
        this.commands.clearCommands();
        return this;
    }

    addGenericHandler(handler: typeof CommandHandler) {
        this.commands.addGenericHandler(handler);
        return this;
    }

    removeGenericHandler() {
        this.commands.removeGenericHandler();
        return this;
    }

    addAnyMessageHandler(handler: typeof EventHandler) {
        this.events.addAnyMessageHandler(handler);
        return this;
    }

    removeAnyMessageHandler() {
        this.events.removeAnyMessageHandler();
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
}
