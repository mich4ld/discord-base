import { Client, ClientEvents, Message } from "discord.js";
import { globals } from "./globals";
import { EventHandler, executeEventHandler, getEventHandler } from "./handlers";
import { BaseLogger, getLogger } from "./logger";

export class Events {
    private logger: BaseLogger = getLogger(globals.logger);
    private events: Map<typeof EventHandler, any> = new Map();
    private messageHandler?: typeof EventHandler;

    constructor(
        private client: Client,
    ) {}

    async runMessageHandler(msg: Message) {
        if (this.messageHandler) {
            await executeEventHandler(this.messageHandler, msg);
        }
    }

    addAnyMessageHandler(handler: typeof EventHandler) {
        this.messageHandler = handler;
        return this;
    }

    removeAnyMessageHandler() {
        this.messageHandler = undefined;
        return this;
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
}
