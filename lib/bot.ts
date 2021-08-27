import { CommandsMap } from "./commands";
import { Client, Intents, Message } from 'discord.js';
import { Container } from 'typedi';

interface DiscordConfig {
    token: string;
    activity?: string;
    prefix?: string;
    intents?: number[];
}

export class DiscordBot {
    private config: Required<DiscordConfig> = {
        activity: 'Bot',
        token: '',
        prefix: '!',
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
    }

    private commands: CommandsMap = { }
    private client: Client<boolean>;

    constructor(config: DiscordConfig) {
        this.config = { ...this.config, ...config };

        if (!process.env.DISCORD_TOKEN && !config.token) {
            throw Error('Error: Token is required!');
        }

        this.client = new Client({
            intents: this.config.intents,
        });

        this.bootstrapBot();
    }

    addCommand(command: string, handler: any) {
        this.commands[command] = handler;
        return this;
    }

    addListeners(method: (client: Client) => any) {
        method(this.client);
        return this;
    }

    private async handleCommand(msg: Message, args: string[], command: string) {
        const handler = this.commands[command];

        if (!handler) {
            console.log('Notice: Command not exists');
            return;
        }

        try {
            const handlerInstance = Container.get(handler);
            await handlerInstance.handle(msg, args, command);
        } catch (error) {
            console.log(`Error: Critial error`);
            console.error(error);
        }
        
    }

    private bootstrapBot() {
        this.client.on("ready", () => {
            console.log(`Logged in as ${this.client.user?.tag}!`);
            this.client.user?.setActivity(this.config.activity!);
          });

        this.client.on("messageCreate", async msg => {
            if(msg.content.startsWith(this.config.prefix)) {
                const commandWithPrefix = msg.content.split(this.config.prefix);
                const [ commandName, ...args ] = commandWithPrefix[1].split(' ');
                
                await this.handleCommand(msg, args, commandName);
            }
        })

        this.client
            .on('error', (err) => console.log(`Error: ${err.message}`))

        this.client.login(this.config.token);
    }
}
