/*
    This module hosts js wrapped hybrid like stram + incremental implementations of murmur hashes.
    If you don't need stream interface prefer to use utilities from the "incremental" module.
*/
import { Encoding, OutputType,
         Endianness, IMurHasher } from "./incremental";

export { Encoding, OutputType, Endianness, IMurHasher };

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
}
