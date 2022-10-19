import { setTimeout } from 'timers/promises';
import pino, { transport } from 'pino';
import { test } from 'vitest';

const t = transport({
    target: '../../dist/cjs/index.cjs',
    options: {
        sentry: {
            dsn: '',
        },
        minLevel: 10,
        tags: ['time'],
        context: ['hostname'],
    },
});

const logger = pino(t);

test('log record get to Sentry', async () => {
    logger.error({ err: new Error('test 123'), foo: 'bar' });
    await setTimeout(1000);
}, 10000);
