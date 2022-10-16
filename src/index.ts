import {
    captureException,
    captureMessage,
    init,
    NodeOptions,
    SeverityLevel,
} from '@sentry/node';
import get from 'lodash.get';
import type { Primitive } from '@sentry/types';
import type { Scope } from '@sentry/types/types/scope';
import { build, BuildOptions } from './stream';

type Event = Record<string, Primitive> & { level: number };
type PinoSentryOptions = {
    sentry: NodeOptions;
    minLevel?: number;
    withLogRecord?: boolean;
    tags?: string[];
    context?: string[];
} & Partial<BuildOptions>;

const pinoLevelToSentryLevel = (level: number): SeverityLevel => {
    if (level === 60) { return 'fatal'; }
    if (level >= 50) { return 'error'; }
    if (level >= 40) { return 'warning'; }
    if (level >= 30) { return 'log'; }
    if (level >= 20) { return 'info'; }
    return 'debug';
};

function enrichScope(scope: Scope, pinoEvent: Event, opts: PinoSentryOptions): Scope {
    scope.setLevel(pinoLevelToSentryLevel(pinoEvent.level));

    if (opts.withLogRecord) {
        scope.setContext('pino-log-record', pinoEvent);
    }

    opts.tags?.forEach((tag) => scope.setTag(tag, get(pinoEvent, tag)));

    if (opts.context?.length) {
        const context = opts.context?.reduce((accum, c) => ({
            ...accum,
            [c]: get(pinoEvent, c),
        }), {} as Record<string, Primitive>);

        scope.setContext('pino-context', context);
    }

    return scope;
}

// eslint-disable-next-line @typescript-eslint/ban-types
const defaultClose = (err: Error, cb: Function): void => {
    if (err) {
        captureException(err);
    }

    process.nextTick(cb, err);
};

const defaultOptions: Partial<PinoSentryOptions> & { minLevel: 10, withLogRecord: false } = {
    minLevel: 10,
    withLogRecord: false,
};

const deserializeError = (e: Error | string): Event & { level?: number } => {
    if (e instanceof Error) {
        return { err: e } as unknown as Event;
    }

    if (typeof e === 'string') {
        try {
            return JSON.parse(e) as Event;
        } catch (err) {
            // Fall through
        }
    }

    return { err: new Error(e) } as unknown as Event;
};

// eslint-disable-next-line import/no-default-export
export default async function transport(
    initSentryOptions: Partial<PinoSentryOptions>,
): Promise<ReturnType<typeof build> | null> {
    const options = { ...defaultOptions, ...initSentryOptions } as PinoSentryOptions & typeof defaultOptions;

    init(options.sentry);

    try {
        const stream = build(async (source): Promise<void> => {
            source.on('data', (data) => {
                if (!data) {
                    return;
                }

                const obj = {
                    // @ts-ignore
                    level: options.minLevel,
                    ...deserializeError(data),
                } as Event;

                try {
                    const serializedError = obj.err;
                    const { level } = obj;

                    if (level >= options.minLevel) {
                        if (serializedError) {
                            captureException(
                                serializedError,
                                (scope) => enrichScope(scope, obj, options),
                            );
                        } else {
                            captureMessage(
                                (obj.msg || obj.message || obj) as string,
                                (scope) => enrichScope(scope, obj as Event, options),
                            );
                        }
                    }
                } catch (e) {
                    // Capture exception and allow loop to continue
                    captureException(e);
                }
            });
        }, {
            close: options.close || defaultClose,
            metadata: options.metadata,
            parse: options.parse,
            parseLine: options.parseLine,
        });

        stream.on('unknown', (line: string, e: Error) => {
            captureException(e, { extra: { line } });
        });

        stream.on('error', (line: string, e: Error) => {
            captureException(e, { extra: { line } });
        });

        return stream;
    } catch (e) {
        captureException(e);
        return null;
    }
}
