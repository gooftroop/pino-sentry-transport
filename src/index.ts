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

interface PinoSentryOptions {
    sentry: NodeOptions;
    minLevel?: number;
    withLogRecord?: boolean;
    tags?: string[];
    context?: string[];
}

const defaultOptions: Partial<PinoSentryOptions> & { minLevel: 10, withLogRecord: false } = {
    minLevel: 10,
    withLogRecord: false,
};

// eslint-disable-next-line import/no-default-export
export default async function transport(
    initSentryOptions: Partial<PinoSentryOptions>,
): Promise<ReturnType<typeof build>> {
    const pinoSentryOptions = { ...defaultOptions, ...initSentryOptions };

    init(pinoSentryOptions.sentry);

    function enrichScope(scope: Scope, pinoEvent: Event): Scope {
        scope.setLevel(pinoLevelToSentryLevel(pinoEvent.level));

        if (pinoSentryOptions.withLogRecord) {
            scope.setContext('pino-log-record', pinoEvent);
        }

        pinoSentryOptions.tags?.forEach((tag) => scope.setTag(tag, get(pinoEvent, tag)));

        if (pinoSentryOptions.context?.length) {
            const context = pinoSentryOptions.context?.reduce((accum, c) => ({
                ...accum,
                [c]: get(pinoEvent, c),
            }), {} as Record<string, Primitive>);

            scope.setContext('pino-context', context);
        }

        return scope;
    }

    return build(async (source) => {
        try {
            for await (const obj of source) {
                if (!obj) {
                    return;
                }

                try {
                    const serializedError = obj?.err;
                    const { level } = obj;

                    if (level > pinoSentryOptions.minLevel) {
                        if (serializedError) {
                            captureException(deserializePinoError(serializedError), (scope) => enrichScope(scope, obj));
                        } else {
                            captureMessage(obj.msg, (scope) => enrichScope(scope, obj as Event));
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
    });
}
