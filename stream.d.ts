/**
 * `murmurhash-native/stream` module.
 *
 * Example:
 *
 * ```ts
 * import { createHash } from "murmurhash-native/stream"
 * import * as fs from "fs"
 *
 * fs.createReadStream("hash_me.txt")
 * .pipe(createHash("murmurhash128x64", {seed: 42, encoding: "hex"}))
 * .pipe(fs.createWriteStream("hash_me.txt.hash"))
 * ```
 *
 * If you don't need stream interface prefer to use utilities from the [[incremental]] module.
 * @module stream
 */

/***/
import { TransformOptions, Transform } from "stream";
import { Encoding, OutputType,
         Endianness, IMurHasher } from "./incremental";

export { Encoding, OutputType, Endianness, IMurHasher };

/**
 * Lists available algorithm names for [createHash].
 */
export function getHashes(): string[];
/**
 * Constructs a new MurmurHash object that can be used to generate murmurhash digests
 * from the data stream.
 *
 * If algorithm is an instance of a MurmurHash or a serialized object,
 * the seed option is being ignored.
 * 
 * @param algorithm one of the available murmurhash algorithms,
 *        a murmur hasher instance or a serialized object.
 * @param options hasher or stream options.
 */
export function createHash(algorithm: string|MurmurHash|MurmurHashSerial, options?: MurmurHashOptions): MurmurHash;
/**
 * Constructs a new MurmurHash object that can be used to generate murmurhash digests
 * from the data stream.
 *
 * @param algorithm one of the available murmurhash algorithms.
 * @param seed initial hash seed as an unsigned 32-bit integer.
 */
export function createHash(algorithm: string, seed?: number): MurmurHash;

/** Options for createHash */
export interface MurmurHashOptions extends TransformOptions {
    /** Initial hash seed as an unsigned 32-bit integer. */
    seed?: number;
    /** Digest byte order. */
    endianness?: Endianness;
}

/** A serialized MurmurHash object representation created by [[MurmurHash.toJSON]] function */
export interface MurmurHashSerial {
    type: string;
    seed: string;
}

/** An incremental murmur hash utility with additional node's stream.Transform api */
export class MurmurHash extends Transform implements IMurHasher {
    /** Size in bytes of the serialized hasher. */
    static readonly SERIAL_BYTE_LENGTH: number;
    readonly SERIAL_BYTE_LENGTH: number;
    constructor(algorithm: string|MurmurHash|MurmurHashSerial, options?: MurmurHashOptions);
    constructor(algorithm: string, seed?: number);
    copy(target: MurmurHash): MurmurHash;
    digest(outputType?: OutputType): number|string|Buffer;
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
    protected _handle: IMurHasher;
}
