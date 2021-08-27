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

    handle(msg: Message) {
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
