import {
    captureException,
    captureMessage,
    init,
    NodeOptions,
    SeverityLevel,
} from '@sentry/node';
import { Primitive } from '@sentry/types';
import { Scope } from '@sentry/types/types/scope';
import get from 'lodash.get';
import pino from 'pino';
import build from 'pino-abstract-transport';

type Event = Record<string, Primitive> & { level: number };

// Taken from pino-abstract-transport - it's not an exported type
type BuildOptions = {
    /**
     * `parseLine(line)` a function that is used to parse line received from pino.
     * @default JSON.parse
     */
    parseLine?: (line: string) => unknown;

    /**
     * `parse` an option to change to data format passed to build function.
     * @default undefined
     *
     */
    parse?: 'lines';

    /**
     * `close(err, cb)` a function that is called to shutdown the transport.
     * It's called both on error and non-error shutdowns. It can also return
     * a promise. In this case discard the the cb argument.
     *
     * @example
     * ```typescript
     * {
     *   close: function (err, cb) {
     *     process.nextTick(cb, err)
     *   }
     * }
     * ```
     * */
    // eslint-disable-next-line @typescript-eslint/ban-types
    close?: (err: Error, cb: Function) => void | Promise<void>;

    /**
     * `metadata` If set to false, do not add metadata properties to the returned stream
     */
    metadata?: false;
};

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

function deserializePinoError(pinoErr: pino.SerializedError): Error {
    const { message, stack } = pinoErr;
    const newError = new Error(message);

    newError.stack = stack;
    return newError;
}

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

// eslint-disable-next-line import/no-default-export
export default async function transport(
    initSentryOptions: Partial<PinoSentryOptions>,
): Promise<ReturnType<typeof build>> {
    const options = { ...defaultOptions, ...initSentryOptions } as PinoSentryOptions & typeof defaultOptions;

    init(options.sentry);

    return build(async (source): Promise<void> => {
        try {
            for await (const obj of source) {
                if (!obj) {
                    return;
                }

                try {
                    const serializedError = obj?.err;
                    const { level } = obj;

                    if (level > options.minLevel) {
                        if (serializedError) {
                            captureException(
                                deserializePinoError(serializedError),
                                (scope) => enrichScope(scope, obj, options),
                            );
                        } else {
                            captureMessage(obj.msg, (scope) => enrichScope(scope, obj as Event, options));
                        }
                    }
                } catch (e) {
                    // Capture exception and allow loop to continue
                    captureException(e);
                }
            }
        } catch (e) {
            // Record error and allow transport to gracefully exit to prevent breaking consumer
            captureException(e);
        }
    }, {
        close: options.close || defaultClose,
        metadata: options.metadata,
        parse: options.parse,
        parseLine: options.parseLine,
    });
}
