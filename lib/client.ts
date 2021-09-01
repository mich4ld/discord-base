import { ActivityOptions, Client } from "discord.js";
import { DiscordConfig } from "./config";
import { globals } from "./globals";
import { BaseLogger, getLogger } from "./logger";

export class DiscordClient {
    private client: Client<boolean>;
    private logger: BaseLogger = getLogger(globals.logger);

    constructor(client: Client) {
        this.client = client;
    }

    async configureClient(config: DiscordConfig) {
        this.configureActivity(config.activity);
        await this.configureName(config.name);
        await this.configureAvatar(config.avatarURL);
    }

    private configureActivity(activity?: ActivityOptions | string) {
        if (this.client.user && activity) {
            if (typeof activity === 'string') {
                this.client.user.setActivity({ name: activity });
            } else {
                this.client.user.setActivity(activity);
            }
        }
    }

    private async configureName(name?: string) {
        if (this.client.user && name && this.client.user.username !== name) {
            try {
                const oldName = this.client.user.username;
                await this.client.user.setUsername(name);
                this.logger.info(`Changed bot's name from ${oldName} to ${name}`);
            } catch (err) {
                if (err instanceof Error) {
                    this.logger.error(err.message);
                }

                this.logger.error(err);
            }
        }
    }

    private async configureAvatar(url?: string) {
        if (this.client.user && url) {
            try {
                await this.client.user.setAvatar(url);      
                this.logger.info("Changed bot's avatar");
            } catch (err) {
                if (err instanceof Error) {
                    this.logger.error(err.message);
                }

                this.logger.error(err);
            }
        }
    }
}