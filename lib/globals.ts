import { BaseLogger, Logger } from "./logger";

interface IGlobals {
    logger: typeof BaseLogger;
}

export const globals: IGlobals = {
    'logger': Logger,
}