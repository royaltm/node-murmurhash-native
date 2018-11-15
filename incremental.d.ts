/**
 * `murmurhash-native/incremental` module.
 *
 * Example:
 *
 * ```ts
 * import { MurmurHash128x64 } from "murmurhash-native/incremental"
 *
 * let hasher = new MurmurHash128x64(42)
 * hasher.update("hash ")
 * hasher.update("me!")
 * console.log(hasher.digest("hex"))
 * ```
 *
 * This module hosts native implementations of incremental murmur hashes.
 *
 * @module incremental
 */

/***/
import { Encoding, OutputType } from "./index";

export { Encoding, OutputType };

/** An endianness type for the murmur hash incremental utilities */
export type Endianness = "BE"|"LE"|"platform";

/** A common interface to all of the murmur hash incremental utilities. */
export interface IMurHasher {
    /** Size in bytes of the serialized hasher. */
    readonly SERIAL_BYTE_LENGTH: number;
    /**
     * Copies the internal state onto the target utility.
     * 
     * This method does not alter target endianness.
     * 
     * @param target a different instance of a MurmurHash utility of the same type.
     * @returns target.
     */
    copy(target: IMurHasher): IMurHasher;
    /**
     * Generates the murmur hash of all of the data provided so far.
     *
     * The order of bytes written to a Buffer or encoded string depends on
     * endianness property.
     *
     * @param output a Buffer object to write hash bytes to; the same object will be returned.
     * @param offset start writing into the output at offset byte;
     *        negative offset starts from the end of the output buffer.
     * @param length a number of bytes to write from calculated hash;
     *        negative length starts from the end of the hash;
     *        if absolute value of length is larger than the size of a calculated
     *        hash, bytes are written only up to the hash size.
     * @returns murmur hash.
     */
    digest(output: Buffer, offset?: number, length?: number): Buffer;
    /**
     * Generates the murmur hash of all of the data provided so far.
     *
     * If outputType is not provided a new Buffer instance is returned.
     * 
     * The order of bytes written to a Buffer or encoded string depends on
     * endianness property.
     *
     * @param outputType indicates the form and encoding of the returned hash.
     * @returns murmur hash.
     */
    digest(outputType?: OutputType): number|string|Buffer;
    /**
     * Serializes the internal state of the murmur hash utility instance
     *
     * The returned type depends on the implementation.
     **/
    toJSON(): any;
    /**
     * Serializes the internal state of the murmur hash utility instance
     * into the provided Buffer.
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
     * Serializes the internal state of the murmur hash utility instance.
     * 
     * The serial is generated as a base64 encoded string.
     */
    serialize(): string;
    /**
     * Updates a internal state with the given data asynchronously.
     *
     * If data is a Buffer then encoding is being ignored.
     *
     * The hash will be updated asynchronously using libuv worker queue.
     * 
     * @param data a chunk of data to calculate hash from.
     * @param encoding of the data provided as a string.
     * @param callback will be called when asynchronous operation completes.
     */
    update(data: string|Buffer, encoding: Encoding, callback: (err: Error) => void): void;
    /**
     * Updates a internal state with the given data asynchronously.
     *
     * If the data is a string, an encoding of "utf8" is assumed.
     *
     * The hash will be updated asynchronously using libuv worker queue.
     * 
     * @param data a chunk of data to calculate hash from.
     * @param callback will be called when asynchronous operation completes.
     */
    update(data: string|Buffer, callback: (err: Error) => void): void;
    /**
     * Updates a internal state with the given data.
     *
     * If the data is a string and encoding is not explicitly provided,
     * an encoding of "utf8" is being assumed.
     *
     * @param data a chunk of data to calculate hash from.
     * @param encoding of the data provided as a string.
     */
    update(data: string|Buffer, encoding?: Encoding): this;
    /** Digest byte order. */
    endianness: Endianness;
    /**
     * True if asynchronous update is in progress.
     *
     * When this property is true, trying to update, calculate digest, serialize or copy state will result in
     * an error thrown from the related method.
     */
    readonly isBusy: boolean;
    /** The total (modulo 2^32) bytes of data provided so far. */
    readonly total: number;
}

/** A factory interface for murmurhash incremental utility */
export interface IMurHasherConstructor {
    /** Size in bytes of the serialized hasher. */
    readonly SERIAL_BYTE_LENGTH: number;
    /**
     * Creates MurmurHash utility.
     *
     * The default seed is 0 and the endianness is set to "BE".
     */
    new(): IMurHasher;
    /**
     * Creates MurmurHash utility.
     *
     * If not provided, the endianness is set to "BE".
     *
     * @param seed initial murmur hash seed as an unsigned 32-bit integer.
     * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is "BE".
     */
    new(seed: number, endianness?: Endianness): IMurHasher;
    /**
     * Creates MurmurHash utility.
     *
     * The initial state is taken from the serialized state. Throws an error if serial is incorrect.
     *
     * @param serial serialized state of the same MurmurHash type.
     * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is "BE".
     */
    new(serial: string|Buffer, endianness?: Endianness): IMurHasher;
    /**
     * Creates MurmurHash utility.
     *
     * The initial state is taken from another instance of murmur hash utility.
     * Throws an error if incompatible hash is provided.
     *
     * @param hash an instance of another MurmurHash.
     * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is hash.endianness.
     */
    new(hash: IMurHasher, endianness?: Endianness): IMurHasher;
}

/** @hidden An abstract base class for the murmurhash incremental utility. */
declare abstract class IMurHasherBase implements IMurHasher {
    /** Size in bytes of the serialized hasher. */
    static readonly SERIAL_BYTE_LENGTH: number;
    readonly SERIAL_BYTE_LENGTH: number;
    /**
     * Creates MurmurHash utility.
     *
     * The default seed is 0 and the endianness is set to "BE".
     */
    constructor();
    /**
     * Creates MurmurHash utility.
     *
     * If not provided, the endianness is set to "BE".
     *
     * @param seed initial murmur hash seed as an unsigned 32-bit integer.
     * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is "BE".
     */
    constructor(seed: number, endianness?: Endianness);
    /**
     * Creates MurmurHash utility.
     * 
     * The initial state is taken from the serialized state. Throws an error if serial is incorrect.
     * 
     * @param serial serialized state of the same MurmurHash type.
     * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is "BE".
     */
    constructor(serial: string|Buffer, endianness?: Endianness);
    /**
     * Creates MurmurHash utility.
     *
     * The initial state is taken from another instance of murmur hash utility.
     * Throws an error if incompatible hash is provided.
     *
     * @param hash an instance of another MurmurHash.
     * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is hash.endianness.
     */
    constructor(hash: IMurHasher, endianness?: Endianness);
    copy(target: IMurHasher): IMurHasher;
    digest(output: Buffer, offset?: number, length?: number): Buffer;
    digest(outputType?: OutputType): number|string|Buffer;
    toJSON(): string;
    serialize(output: Buffer, offset?: number): Buffer;
    serialize(): string;
    update(data: string|Buffer, encoding: Encoding, callback: (err: Error) => void): void;
    update(data: string|Buffer, callback: (err: Error) => void): void;
    update(data: string|Buffer, encoding?: Encoding): this;
    endianness: Endianness;
    readonly isBusy: boolean;
    readonly total: number;
}

/** A murmurhash32 implementation of the murmur hash incremental utility */
export class MurmurHash extends IMurHasherBase {}

/** A murmurhash128 (os arch) implementation of the murmur hash incremental utility */
export class MurmurHash128 extends IMurHasherBase {
    digest(output: Buffer, offset?: number, length?: number): Buffer;
    digest(outputType?: OutputType): string|Buffer;
}

/** A murmurhash128x64 implementation of the murmur hash incremental utility */
export class MurmurHash128x64 extends IMurHasherBase {
    digest(output: Buffer, offset?: number, length?: number): Buffer;
    digest(outputType?: OutputType): string|Buffer;
}

/** A murmurhash128x86 implementation of the murmur hash incremental utility */
export class MurmurHash128x86 extends IMurHasherBase {
    digest(output: Buffer, offset?: number, length?: number): Buffer;
    digest(outputType?: OutputType): string|Buffer;
}
