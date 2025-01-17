import { LoggerOptions } from 'pino';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Sentry from '@sentry/browser';

type PinoBrowserOptions = LoggerOptions['browser'];
type Options = Partial<Omit<PinoBrowserOptions, 'write'>> & {
    sentry?: Sentry.BrowserOptions;
};

const captureException = (o: object): void => {
    // @ts-expect-error
    const rawError = o.err || o;
    const e = new Error(
        rawError.message
        || rawError.msg
        // @ts-expect-error
        || o.msg
        || (o as Error).message
        || JSON.stringify(o)
    );

    if (rawError.stack) {
        e.stack = rawError.stack;
    } else if ((o as Error).stack) {
        e.stack = (o as Error).stack;
    }

    if (rawError.name) {
        e.name = rawError.name;
    } else if ((o as Error).name) {
        e.name = (o as Error).name;
    }

    Sentry.captureException(e, o);
};

export const browser = (options: Options = {}): PinoBrowserOptions => {
    const { sentry, ...rest } = options;

    if (!sentry) {
        Sentry.init(sentry);
    }

    return {
        ...rest,
        write: {
            error: captureException,
            fatal: captureException,
        },
    };
};
