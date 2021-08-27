![Group 1(1)](https://user-images.githubusercontent.com/43048524/131164717-e9ed4291-1eb3-4dbc-bfab-fb20f0f4dc19.png)
# Discord Base
Simple TypeScript abstraction for creating Discord bots (using `discord.js` and `typedi`)

### Installation
```sh
npm i @mich4l/discord-base
```

### Code example
`index.ts`
```ts
import { DiscordBot } from '@mich4l/discord-base';
import { ExampleCommand } from './commands/exampleCommand';
import { token } from './config.json'

const bot = new DiscordBot({
    token,
    activity: 'CS:GO',
});

bot.addCommand('example', ExampleCommand);
```

`exampleCommand.ts`
```ts
import { Command, CommandHandler } from '@mich4l/discord-base';
import { Message } from 'discord.js';
import { ExampleService } from '../services/exampleService';

@Command()
export class ExampleCommand implements CommandHandler {
    constructor(
        private readonly exampleService: ExampleService
    ) {}

    handle(msg: Message, args: string[]) {
        const message = this.exampleService.getMessage();

        msg.reply(message);
    }
}
```

`exampleService.ts`
```ts
import { Service } from '@mich4l/discord-base';

@Service()
export class ExampleService {
    getMessage() {
        return 'Hello world';
    }
}
```
