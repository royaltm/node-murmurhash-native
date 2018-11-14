/// <reference types="node" />

/**
 * Indicates the form and encoding of the resulting hash and can be one of:
 *
 * - 'base64' - base64 string
 * - 'binary' - binary string
 * - 'buffer' - a new Buffer object
 * - 'hex'    - hexadecimal string
 * - 'number' - for 32-bit murmur hash an unsigned 32-bit integer,
 *              other hashes - hexadecimal string
 */
export type OutputType = "base64"|"binary"|"buffer"|"hex"|"number";
/**
 * The expected encoding of the provided data as a string.
 */
export type Encoding = "ascii"|"base64"|"binary"|"hex"|"ucs-2"|"ucs2"|"utf-16le"|"utf-8"|"utf16le"|"utf8";

/** An interface for murmurhash functions */
export interface MurmurHashFn {
    (data: string|Buffer): number|string;
    (data: string|Buffer, callback: (err: Error, res: number|string) => void): void;
    (data: string|Buffer, output: Buffer, offset?: number, length?: number): Buffer;
    (data: string|Buffer, output: Buffer, callback: (err: Error, res: Buffer) => void): void;
    (data: string|Buffer, output: Buffer, offset: number, callback: (err: Error, res: Buffer) => void): void;
    (data: string|Buffer, output: Buffer, offset: number, length: number, callback: (err: Error, res: Buffer) => void): void;
    (data: string, encOrOutType: Encoding|OutputType, seed?: number): number|string|Buffer;
    (data: string, encOrOutType: Encoding|OutputType, callback: (err: Error, res: number|string|Buffer) => void): void;
    (data: string, encOrOutType: Encoding|OutputType, seed: number, callback: (err: Error, res: number|string|Buffer) => void): void;
    (data: Buffer, outputType: OutputType, seed?: number): number|string|Buffer;
    (data: Buffer, outputType: OutputType, callback: (err: Error, res: number|string|Buffer) => void): void;
    (data: Buffer, outputType: OutputType, seed: number, callback: (err: Error, res: number|string|Buffer) => void): void;
    (data: string|Buffer, seed: number): number|string;
    (data: string|Buffer, seed: number, callback: (err: Error, res: number|string) => void): void;
    (data: string|Buffer, seed: number, output: Buffer, offset?: number, length?: number): Buffer;
    (data: string|Buffer, seed: number, output: Buffer, callback: (err: Error, res: Buffer) => void): void;
    (data: string|Buffer, seed: number, output: Buffer, offset: number, callback: (err: Error, res: Buffer) => void): void;
    (data: string|Buffer, seed: number, output: Buffer, offset: number, length: number, callback: (err: Error, res: Buffer) => void): void;
    (data: string|Buffer, seed: number, outputType: OutputType): number|string|Buffer;
    (data: string|Buffer, seed: number, outputType: OutputType, callback: (err: Error, res: number|string|Buffer) => void): void;
    (data: string|Buffer, encoding: Encoding, outputType: OutputType): number|string|Buffer;
    (data: string|Buffer, encoding: Encoding, outputType: OutputType, callback: (err: Error, res: number|string|Buffer) => void): void;
    (data: string, encoding: Encoding, output: Buffer, offset?: number, length?: number): Buffer;
    (data: string, encoding: Encoding, output: Buffer, callback: (err: Error, res: Buffer) => void): void;
    (data: string, encoding: Encoding, output: Buffer, offset: number, callback: (err: Error, res: Buffer) => void): void;
    (data: string, encoding: Encoding, output: Buffer, offset: number, length: number, callback: (err: Error, res: Buffer) => void): void;
    (data: string, encoding: Encoding, seed: number): number|string;
    (data: string, encoding: Encoding, seed: number, callback: (err: Error, res: number|string) => void): void;
    (data: string, encoding: Encoding, seed: number, output: Buffer, offset?: number, length?: number): Buffer;
    (data: string, encoding: Encoding, seed: number, output: Buffer, callback: (err: Error, res: Buffer) => void): void;
    (data: string, encoding: Encoding, seed: number, output: Buffer, offset: number, callback: (err: Error, res: Buffer) => void): void;
    (data: string, encoding: Encoding, seed: number, output: Buffer, offset: number, length: number, callback: (err: Error, res: Buffer) => void): void;
    (data: string, encoding: Encoding, seed: number, outputType: OutputType): number|string|Buffer;
    (data: string, encoding: Encoding, seed: number, outputType: OutputType, callback: (err: Error, res: number|string|Buffer) => void): void;
}

/** An interface for murmurhash 32-bit functions */
export interface MurmurHashFnI extends MurmurHashFn {
    (data: string|Buffer): number;
    (data: string|Buffer, callback: (err: Error, res: number) => void): void;
    (data: string|Buffer, seed: number): number;
    (data: string|Buffer, seed: number, callback: (err: Error, res: number) => void): void;
    (data: string, encoding: Encoding, seed: number): number;
    (data: string, encoding: Encoding, seed: number, callback: (err: Error, res: number) => void): void;
}

/** An interface for murmurhash 64/128-bit functions */
export interface MurmurHashFnH extends MurmurHashFn {
    (data: string|Buffer): string;
    (data: string|Buffer, callback: (err: Error, res: string) => void): void;
    (data: string, encOrOutType: Encoding|OutputType, seed?: number): string|Buffer;
    (data: string, encOrOutType: Encoding|OutputType, callback: (err: Error, res: string|Buffer) => void): void;
    (data: string, encOrOutType: Encoding|OutputType, seed: number, callback: (err: Error, res: string|Buffer) => void): void;
    (data: Buffer, outputType: OutputType, seed?: number): string|Buffer;
    (data: Buffer, outputType: OutputType, callback: (err: Error, res: string|Buffer) => void): void;
    (data: Buffer, outputType: OutputType, seed: number, callback: (err: Error, res: string|Buffer) => void): void;
    (data: string|Buffer, seed: number): string;
    (data: string|Buffer, seed: number, callback: (err: Error, res: string) => void): void;
    (data: string|Buffer, seed: number, outputType: OutputType): string|Buffer;
    (data: string|Buffer, seed: number, outputType: OutputType, callback: (err: Error, res: string|Buffer) => void): void;
    (data: string|Buffer, encoding: Encoding, outputType: OutputType): string|Buffer;
    (data: string|Buffer, encoding: Encoding, outputType: OutputType, callback: (err: Error, res: string|Buffer) => void): void;
    (data: string, encoding: Encoding, seed: number): string;
    (data: string, encoding: Encoding, seed: number, callback: (err: Error, res: string) => void): void;
    (data: string, encoding: Encoding, seed: number, outputType: OutputType): string|Buffer;
    (data: string, encoding: Encoding, seed: number, outputType: OutputType, callback: (err: Error, res: string|Buffer) => void): void;
}

export const murmurHash: MurmurHashFnI;
export const murmurHash32: MurmurHashFnI;
export const murmurHash64: MurmurHashFnH;
export const murmurHash64x64: MurmurHashFnH;
export const murmurHash64x86: MurmurHashFnH;
export const murmurHash128: MurmurHashFnH;
export const murmurHash128x64: MurmurHashFnH;
export const murmurHash128x86: MurmurHashFnH;

export namespace BE {
    const murmurHash: MurmurHashFnI;
    const murmurHash32: MurmurHashFnI;
    const murmurHash64: MurmurHashFnH;
    const murmurHash64x64: MurmurHashFnH;
    const murmurHash64x86: MurmurHashFnH;
    const murmurHash128: MurmurHashFnH;
    const murmurHash128x64: MurmurHashFnH;
    const murmurHash128x86: MurmurHashFnH;
}

export namespace LE {
    const murmurHash: MurmurHashFnI;
    const murmurHash32: MurmurHashFnI;
    const murmurHash64: MurmurHashFnH;
    const murmurHash64x64: MurmurHashFnH;
    const murmurHash64x86: MurmurHashFnH;
    const murmurHash128: MurmurHashFnH;
    const murmurHash128x64: MurmurHashFnH;
    const murmurHash128x86: MurmurHashFnH;
}

export namespace platform {
    const murmurHash: MurmurHashFnI;
    const murmurHash32: MurmurHashFnI;
    const murmurHash64: MurmurHashFnH;
    const murmurHash64x64: MurmurHashFnH;
    const murmurHash64x86: MurmurHashFnH;
    const murmurHash128: MurmurHashFnH;
    const murmurHash128x64: MurmurHashFnH;
    const murmurHash128x86: MurmurHashFnH;
}

declare module "promisify" {
    /** An interface for promisified murmurhash functions */
    export interface MurmurHashFnAsync {
        (data: string|Buffer): Promise<number|string>;
        (data: string|Buffer, output: Buffer, offset?: number, length?: number): Promise<Buffer>;
        (data: string, encOrOutType: Encoding|OutputType, seed?: number): Promise<number|string|Buffer>;
        (data: Buffer, outputType: OutputType, seed?: number): Promise<number|string|Buffer>;
        (data: string|Buffer, seed: number): Promise<number|string>;
        (data: string|Buffer, seed: number, output: Buffer, offset?: number, length?: number): Promise<Buffer>;
        (data: string|Buffer, seed: number, outputType: OutputType): Promise<number|string|Buffer>;
        (data: string|Buffer, encoding: Encoding, outputType: OutputType): Promise<number|string|Buffer>;
        (data: string, encoding: Encoding, output: Buffer, offset?: number, length?: number): Promise<Buffer>;
        (data: string, encoding: Encoding, seed: number): Promise<number|string>;
        (data: string, encoding: Encoding, seed: number, output: Buffer, offset?: number, length?: number): Promise<Buffer>;
        (data: string, encoding: Encoding, seed: number, outputType: OutputType): Promise<number|string|Buffer>;
    }
    /** An interface for promisified murmurhash 32-bit functions */
    export interface MurmurHashFnAsyncI extends MurmurHashFnAsync {
        (data: string|Buffer): Promise<number>;
        (data: string|Buffer, seed: number): Promise<number>;
        (data: string, encoding: Encoding, seed: number): Promise<number>;
    }
    /** An interface for promisified murmurhash 64/128-bit functions */
    export interface MurmurHashFnAsyncH extends MurmurHashFnAsync {
        (data: string|Buffer): Promise<string>;
        (data: string, encOrOutType: Encoding|OutputType, seed?: number): Promise<string|Buffer>;
        (data: Buffer, outputType: OutputType, seed?: number): Promise<string|Buffer>;
        (data: string|Buffer, seed: number): Promise<string>;
        (data: string|Buffer, seed: number, outputType: OutputType): Promise<string|Buffer>;
        (data: string|Buffer, encoding: Encoding, outputType: OutputType): Promise<string|Buffer>;
        (data: string, encoding: Encoding, seed: number): Promise<string>;
        (data: string, encoding: Encoding, seed: number, outputType: OutputType): Promise<string|Buffer>;
    }

    export interface MurmurHashAsyncNs {
        readonly murmurHashAsync: MurmurHashFnAsyncI;
        readonly murmurHash32Async: MurmurHashFnAsyncI;
        readonly murmurHash64x64Async: MurmurHashFnAsyncH;
        readonly murmurHash64x86Async: MurmurHashFnAsyncH;
        readonly murmurHash128x64Async: MurmurHashFnAsyncH;
        readonly murmurHash128x86Async: MurmurHashFnAsyncH;
        readonly murmurHash64Async: MurmurHashFnAsyncH;
        readonly murmurHash128Async: MurmurHashFnAsyncH;
        readonly BE: MurmurHashAsyncNs;
        readonly LE: MurmurHashAsyncNs;
        readonly platform: MurmurHashAsyncNs;
    }
    /**
     * Returns all promisified murmur hash functions in their corresponding namespaces.
     *
     * @param promise optional Promise constructor
     */
    export default function(promise?: PromiseConstructorLike): MurmurHashAsyncNs;
}

/** An endianness type for the murmur hash incremental utilities */
export type Endianness = "BE"|"LE"|"platform";

/** A common interface to all of the murmur hash incremental utilities */
export interface IMurHasher {
    /**
     * Size in bytes of the serialized hasher.
     */
    readonly SERIAL_BYTE_LENGTH: number;
    /**
     * Copy the internal state onto the target utility instance.
     * 
     * This method does not alter target endianness.
     * 
     * @param target - a different instance of MurmurHash utility of the same type.
     * @return target.
     */
    copy(target: ThisType<IMurHasher>): ThisType<IMurHasher>;
    /**
     * Generate the murmur hash of all of the data provided so far.
     * 
     * @param output_type indicates the form and encoding of the returned hash and can be one of:
     *
     * - 'number' - for 32-bit murmur hash an unsigned 32-bit integer,
     *              other hashes - hexadecimal string
     * - 'hex'    - hexadecimal string
     * - 'base64' - base64 string
     * - 'binary' - binary string
     * - 'buffer' - a new Buffer object
     *
     * If `output_type` is not provided a new Buffer instance being is returned.
     * 
     * The order of bytes written to a Buffer or encoded string depends on
     * `endianness` property.
     */
    digest(outputType?: OutputType): number|string|Buffer;
    /**
     * Generate the murmur hash of all of the data provided so far.
     *
     * The order of bytes written to a Buffer or encoded string depends on
     * `endianness` property.
     *
     * @param output a Buffer object to write hash bytes to; the same object will be returned
     * @param offset start writing into output at offset byte.
     *        negative offset starts from the end of the output buffer
     * @param length a number of bytes to write from calculated hash
     *        negative length starts from the end of the hash.
     *        if absolute value of length is larger than the size of a calculated
     *        hash, bytes are written only up to the hash size.
     * @return murmur hash.
     */
    digest(output: Buffer, offset?: number, length?: number): Buffer;
    /**
     * Serialize the internal state of the murmur hash utility instance.
     * 
     * The serial is generated as a base64 encoded string.
     */
    serialize(): string;
    /**
     * Serialize the internal state of the murmur hash utility instance.
     * 
     * When output has not enough space for the serialized data
     * at the given offset it throws an Error. You may consult the required
     * byte length reading constant: SERIAL_BYTE_LENGTH
     * 
     * @param output a Buffer to write serialized state to.
     * @param offset offset at output.
     */
    serialize(output: Buffer, offset?: number): Buffer;
    /**
     * Update internal state with the given data synchronously.
     *
     * If encoding is not provided or is not known and the data is a string,
     * an encoding of 'utf8' is enforced. If data is a Buffer then encoding is ignored.
     */
    update(data: string|Buffer, encoding?: Encoding): this;
    /**
     * Update internal state with the given data asynchronously.
     *
     * The hash will be updated asynchronously using libuv worker queue.
     *
     * If encoding is not provided or is not known and the data is a string,
     * an encoding of 'utf8' is enforced. If data is a Buffer then encoding is ignored.
     */
    update(data: string|Buffer, encoding: Encoding, callback: (err: Error) => void): void;
    update(data: string|Buffer, callback: (err: Error) => void): void;
    /**
     * Digest byte order
     */
    endianness: Endianness;
    /**
     * True if asynchronous update is in progress.
     *
     * When this property is true, trying to update, calculate digest serialize or copy state will result in
     * an error thrown from the related method.
     */
    readonly isBusy: boolean;
    /**
     * The total (modulo 2^32) bytes of data provided so far.
    **/
    readonly total: number;
}

/*
    This module hosts js wrapped hybrid like stram + incremental implementations of murmur hashes.
    If you don't need stream interface prefer to use utilities from the "incremental" module.
*/
declare module "stream" {
    /**
     * Lists available algorithm names for createHash.
     */
    export function getHashes(): string[];
    /**
     * Constructs a new MurmurHash object that can be used to generate murmurhash digests.
     *
     * If `algorithm` is an instance of a MurmurHash or murmurhash serialized object,
     * the seed option is being ignored.
     * 
     * @param algorithm one of available algorithms or a murmur hasher instance or a murmurhash serialized object
     * @param seed initial hash seed
     * @param options hasher options
     */
    export function createHash(algorithm: string, seed?: number): MurmurHash;
    export function createHash(algorithm: string|MurmurHash|MurmurHashSerial, options?: MurmurHashOptions): MurmurHash;

    /** Options for createHash */
    export interface MurmurHashOptions extends TransformOptions {
        seed?: number;
        endianness?: Endianness;
    }

    /** A serialized MurmurHash object representation created by MurmurHash#toJSON function */
    export interface MurmurHashSerial {
        type: string;
        seed: string;
    }

    /** An incremental murmur hash utility with additional node's stream.Transform api */
    export class MurmurHash extends Transform implements IMurHasher {
        private _handle: IMurHasher;
        static readonly SERIAL_BYTE_LENGTH: number;
        readonly SERIAL_BYTE_LENGTH: number;
        constructor(algorithm: string, seed?: number);
        constructor(algorithm: string|MurmurHash|MurmurHashSerial, options?: MurmurHashOptions);
        copy(target: MurmurHash): MurmurHash;
        digest(outputType?: OutputType): string|Buffer;
        digest(output: Buffer, offset?: number, length?: number): Buffer;
        toJSON(): MurmurHashSerial;
        serialize(): string;
        serialize(output: Buffer, offset?: number): Buffer;
        update(data: string|Buffer, encoding?: Encoding): this;
        update(data: string|Buffer, encoding: Encoding, callback: (err: Error) => void): void;
        update(data: string|Buffer, callback: (err: Error) => void): void;
        endianness: Endianness;
        readonly isBusy: boolean;
        readonly total: number;
    }
}

/*
    This module hosts native incremental implementations of murmur hashes.
*/
declare module "incremental" {
    /** A murmurhash32 implementation of the murmur hash incremental utility */
    export class MurmurHash implements IMurHasher {
        static readonly SERIAL_BYTE_LENGTH: number;
        readonly SERIAL_BYTE_LENGTH: number;
        /**
         * Create MurmurHash utility.
         *
         * The murmur hash seed is initialized to 0.
         */
        constructor();
        /**
         * Create MurmurHash utility.
         *
         * @param seed initial murmur hash seed as 32 bit integer.
         * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is 'BE'.
         */
        constructor(seed: number, endianness?: Endianness);
        /**
         * Create MurmurHash utility.
         *
         * @param hash an instance of another MurmurHash.
         * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is 'BE'.
         */
        constructor(hash: MurmurHash, endianness?: Endianness);
        /**
         * Create MurmurHash utility.
         * 
         * @param serial serialized state of the same MurmurHash type.
         * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is 'BE'.
         */
        constructor(serial: string|Buffer, endianness?: Endianness);
        copy(target: MurmurHash): MurmurHash;
        digest(outputType?: OutputType): number|string|Buffer;
        digest(output: Buffer, offset?: number, length?: number): Buffer;
        toJSON(): string;
        serialize(): string;
        serialize(output: Buffer, offset?: number): Buffer;
        update(data: string|Buffer, encoding?: Encoding): this;
        update(data: string|Buffer, encoding: Encoding, callback: (err: Error) => void): void;
        update(data: string|Buffer, callback: (err: Error) => void): void;
        endianness: Endianness;
        readonly isBusy: boolean;
        readonly total: number;
    }

    /** A murmurhash128 (native arch) implementation of the murmur hash incremental utility */
    export class MurmurHash128 implements IMurHasher {
        static readonly SERIAL_BYTE_LENGTH: number;
        readonly SERIAL_BYTE_LENGTH: number;
        constructor();
        constructor(seed: number, endianness?: Endianness);
        constructor(hash: MurmurHash128, endianness?: Endianness);
        constructor(serial: string|Buffer, endianness?: Endianness);
        copy(target: MurmurHash128): MurmurHash128;
        digest(outputType?: OutputType): string|Buffer;
        digest(output: Buffer, offset?: number, length?: number): Buffer;
        toJSON(): string;
        serialize(): string;
        serialize(output: Buffer, offset?: number): Buffer;
        update(data: string|Buffer, encoding?: Encoding): this;
        update(data: string|Buffer, encoding: Encoding, callback: (err: Error) => void): void;
        update(data: string|Buffer, callback: (err: Error) => void): void;
        endianness: Endianness;
        readonly isBusy: boolean;
        readonly total: number;
    }

    /** A murmurhash128x64 implementation of the murmur hash incremental utility */
    export class MurmurHash128x64 implements IMurHasher {
        static readonly SERIAL_BYTE_LENGTH: number;
        readonly SERIAL_BYTE_LENGTH: number;
        constructor();
        constructor(seed: number, endianness?: Endianness);
        constructor(hash: MurmurHash128x64, endianness?: Endianness);
        constructor(serial: string|Buffer, endianness?: Endianness);
        copy(target: MurmurHash128x64): MurmurHash128x64;
        digest(outputType?: OutputType): string|Buffer;
        digest(output: Buffer, offset?: number, length?: number): Buffer;
        toJSON(): string;
        serialize(): string;
        serialize(output: Buffer, offset?: number): Buffer;
        update(data: string|Buffer, encoding?: Encoding): this;
        update(data: string|Buffer, encoding: Encoding, callback: (err: Error) => void): void;
        update(data: string|Buffer, callback: (err: Error) => void): void;
        endianness: Endianness;
        readonly isBusy: boolean;
        readonly total: number;
    }

    /** A murmurhash128x86 implementation of the murmur hash incremental utility */
    export class MurmurHash128x86 implements IMurHasher {
        static readonly SERIAL_BYTE_LENGTH: number;
        readonly SERIAL_BYTE_LENGTH: number;
        constructor();
        constructor(seed: number, endianness?: Endianness);
        constructor(hash: MurmurHash128x86, endianness?: Endianness);
        constructor(serial: string|Buffer, endianness?: Endianness);
        copy(target: MurmurHash128x86): MurmurHash128x86;
        digest(outputType?: OutputType): string|Buffer;
        digest(output: Buffer, offset?: number, length?: number): Buffer;
        toJSON(): string;
        serialize(): string;
        serialize(output: Buffer, offset?: number): Buffer;
        update(data: string|Buffer, encoding?: Encoding): this;
        update(data: string|Buffer, encoding: Encoding, callback: (err: Error) => void): void;
        update(data: string|Buffer, callback: (err: Error) => void): void;
        endianness: Endianness;
        readonly isBusy: boolean;
        readonly total: number;
    }
}
