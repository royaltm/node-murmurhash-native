/*
    This module hosts native incremental implementations of murmur hashes.
*/
import { Encoding, OutputType } from "./index";

export { Encoding, OutputType };

/** An endianness type for the murmur hash incremental utilities */
export type Endianness = "BE"|"LE"|"platform";

/** A common interface to all of the murmur hash incremental utilities */
export interface IMurHasher {
    /** Size in bytes of the serialized hasher. */
    readonly SERIAL_BYTE_LENGTH: number;
    /**
     * Copy the internal state onto the target utility instance.
     * 
     * This method does not alter target endianness.
     * 
     * @param target a different instance of MurmurHash utility of the same type.
     * @return target.
     */
    copy(target: IMurHasher): IMurHasher;
    /**
     * Generate the murmur hash of all of the data provided so far.
     *
     * If `output_type` is not provided a new Buffer instance being is returned.
     * 
     * The order of bytes written to a Buffer or encoded string depends on
     * `endianness` property.
     *
     * @param outputType indicates the form and encoding of the returned hash.
     * @param output a Buffer object to write hash bytes to; the same object will be returned
     * @param offset start writing into output at offset byte.
     *        negative offset starts from the end of the output buffer
     * @param length a number of bytes to write from calculated hash
     *        negative length starts from the end of the hash.
     *        if absolute value of length is larger than the size of a calculated
     *        hash, bytes are written only up to the hash size.
     * @return murmur hash.
     */
    digest(outputType?: OutputType): number|string|Buffer;
    digest(output: Buffer, offset?: number, length?: number): Buffer;
    /**
     * Serialize the internal state of the murmur hash utility instance.
     * 
     * The serial is generated as a base64 encoded string.
     * When output has not enough space for the serialized data
     * at the given offset it throws an Error. You may consult the required
     * byte length reading constant: SERIAL_BYTE_LENGTH
     * 
     * @param output a Buffer to write serialized state to.
     * @param offset offset at output.
     */
    serialize(): string;
    serialize(output: Buffer, offset?: number): Buffer;
    /**
     * Update internal state with the given data asynchronously.
     *
     * If encoding is not provided or is not known and the data is a string,
     * an encoding of 'utf8' is enforced. If data is a Buffer then encoding is ignored.
     *
     * The hash will be updated asynchronously using libuv worker queue if `callback`
     * argument is present.
     */
    update(data: string|Buffer, encoding?: Encoding): this;
    update(data: string|Buffer, encoding: Encoding, callback: (err: Error) => void): void;
    update(data: string|Buffer, callback: (err: Error) => void): void;
    /** Digest byte order */
    endianness: Endianness;
    /**
     * True if asynchronous update is in progress.
     *
     * When this property is true, trying to update, calculate digest serialize or copy state will result in
     * an error thrown from the related method.
     */
    readonly isBusy: boolean;
    /** The total (modulo 2^32) bytes of data provided so far. */
    readonly total: number;
}

/** A factory interface for murmurhash incremental utility */
export interface IMurHasherConstructor {
    readonly SERIAL_BYTE_LENGTH: number;
    /**
     * Create MurmurHash utility.
     *
     * The murmur hash seed is initialized to 0.
     */
    new(): IMurHasher;
    /**
     * Create MurmurHash utility.
     *
     * @param seed initial murmur hash seed as 32 bit integer.
     * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is 'BE'.
     */
    new(seed: number, endianness?: Endianness): IMurHasher;
    /**
     * Create MurmurHash utility.
     * 
     * @param serial serialized state of the same MurmurHash type.
     * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is 'BE'.
     */
    new(serial: string|Buffer, endianness?: Endianness): IMurHasher;
    /**
     * Create MurmurHash utility.
     *
     * @param hash an instance of another MurmurHash of the same type.
     * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is 'BE'.
     */
    new(hash: IMurHasher, endianness?: Endianness): IMurHasher;
}

/** An abstract base class for the murmurhash incremental utility */
export abstract class IMurHasherBase implements IMurHasher {
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
     * @param serial serialized state of the same MurmurHash type.
     * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is 'BE'.
     */
    constructor(serial: string|Buffer, endianness?: Endianness);
    /**
     * Create MurmurHash utility.
     *
     * @param hash an instance of another MurmurHash.
     * @param endianness digest byte order: "BE", "LE" or "platform", optional. Default is 'BE'.
     */
    constructor(hash: IMurHasherBase, endianness?: Endianness);
    copy(target: IMurHasherBase): IMurHasherBase;
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

/** A murmurhash32 implementation of the murmur hash incremental utility */
export class MurmurHash extends IMurHasherBase {}

/** A murmurhash128 (os arch) implementation of the murmur hash incremental utility */
export class MurmurHash128 extends IMurHasherBase {
    digest(outputType?: OutputType): string|Buffer;
    digest(output: Buffer, offset?: number, length?: number): Buffer;
}

/** A murmurhash128x64 implementation of the murmur hash incremental utility */
export class MurmurHash128x64 extends IMurHasherBase {
    digest(outputType?: OutputType): string|Buffer;
    digest(output: Buffer, offset?: number, length?: number): Buffer;
}

/** A murmurhash128x86 implementation of the murmur hash incremental utility */
export class MurmurHash128x86 extends IMurHasherBase {
    digest(outputType?: OutputType): string|Buffer;
    digest(output: Buffer, offset?: number, length?: number): Buffer;
}
