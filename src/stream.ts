/* eslint-disable @typescript-eslint/ban-types */
import split from 'split2';
import { Duplex } from 'readable-stream';
import type internal from 'node:stream';

const metadata = Symbol.for('pino.metadata');

export type BuildOptions = {
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
    close?: (err: Error, cb: Function) => void | Promise<void>;

    /**
     * `metadata` If set to false, do not add metadata properties to the returned stream
     */
    metadata?: false;
};

/**
 * Pass these options to wrap the split2 stream and
 * the returned stream into a Duplex
 */
export type EnablePipelining = BuildOptions & {
    enablePipelining: true;
};

export interface OnUnknown {
    /**
     * `unknown` is the event emitted where an unparsable line is found
     *
     * @param event 'unknown'
     * @param line the unparsable line
     * @param error the error that was thrown when parsing the line
     */
    on(event: 'unknown', listener: (line: string, error: unknown) => void): void;
}

export type TransformCallback<T> =
    T extends BuildOptions ? (transform: internal.Transform & OnUnknown) => void | Promise<void> :
    T extends EnablePipelining ? (transform: internal.Transform & OnUnknown) => internal.Transform & OnUnknown :
    never;

export type BuildReturnType<T> =
    T extends BuildOptions ? internal.Transform & OnUnknown : internal.Transform;

export type MetadataTransform = internal.Transform & {
    [metadata]: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lastTime: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lastLevel: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lastObj: any,
};

export function defaultClose(err: Error, cb: Function): void {
    process.nextTick(cb, err);
}

export const build = <O extends BuildOptions | EnablePipelining>(
    fn: TransformCallback<O>,
    opts: O = {} as O,
): BuildReturnType<O> => {
    const parseLines = opts.parse === 'lines';
    const parseLine = typeof opts.parseLine === 'function' ? opts.parseLine : JSON.parse;
    const close = opts.close || defaultClose;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = split(function mapper(this: internal.Transform, line): any {
        let value;

        try {
            value = parseLine(line);
        } catch (error) {
            this.emit('unknown', line, error);
            return;
        }

        if (value === null) {
            this.emit('unknown', line, 'Null value ignored');
            return;
        }

        if (typeof value !== 'object') {
            value = {
                data: value,
                time: Date.now(),
            };
        }

        if ((stream as MetadataTransform)[metadata]) {
            (stream as MetadataTransform).lastTime = value.time;
            (stream as MetadataTransform).lastLevel = value.level;
            (stream as MetadataTransform).lastObj = value;
        }

        // eslint-disable-next-line consistent-return
        return parseLines ? line : value;
    }, {
        autoDestroy: true,
        objectMode: true,
        readableObjectMode: true,
        writableObjectMode: true,
    });

    // eslint-disable-next-line no-underscore-dangle
    stream._destroy = (err: Error, cb: Function): void => {
        const promise = close(err, cb);

        if (promise && typeof promise.then === 'function') {
            // @ts-expect-error doesn't matter if it's a promise like return
            promise.then(cb, cb);
        }
    };

    if (opts.metadata !== false) {
        (stream as MetadataTransform)[metadata] = true;
        (stream as MetadataTransform).lastTime = 0;
        (stream as MetadataTransform).lastLevel = 0;
        (stream as MetadataTransform).lastObj = null;
    }

    let res = fn(stream);

    if (res && typeof res.catch === 'function') {
        res.catch((err: Error) => {
            stream.destroy(err);
        });

        // @ts-expect-error set it to null to not retain a reference to the promise
        res = null;
    } else if ((opts as EnablePipelining).enablePipelining && res) {
        return Duplex.from({ writable: stream, readable: res, objectMode: true });
    }

    return stream;
};
