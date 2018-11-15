/**
 * `murmurhash-native` module.
 *
 * Example:
 *
 * ```ts
 * import { murmurHash128x64 } from "murmurhash-native"
 *
 * console.log(murmurHash128x64("hash me!", 42))
 * ```
 *
 * @module murmurhash-native
 */

/**
 * Indicates the form and encoding of the resulting hash and can be one of:
 *
 * - "base64" - base64 string
 * - "binary" - binary string
 * - "buffer" - a new Buffer object
 * - "hex"    - hexadecimal string
 * - "number" - for 32-bit murmur hash an unsigned 32-bit integer, other hashes - hexadecimal string
 */
export type OutputType = "base64"|"binary"|"buffer"|"hex"|"number";
/**
 * The expected encoding of the provided data as a string.
 */
export type Encoding = "ascii"|"base64"|"binary"|"hex"|"ucs-2"|"ucs2"|"utf-16le"|"utf-8"|"utf16le"|"utf8";

/** An interface for murmurhash functions. */
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

/**
 * An interface for murmurhash 32-bit functions.
 *
 * Functions of this type produce hashes as an unsigned 32-bit integers by default
 * and for the "number" output type.
 */
export interface MurmurHashFnI extends MurmurHashFn {
    (data: string|Buffer): number;
    (data: string|Buffer, callback: (err: Error, res: number) => void): void;
    (data: string|Buffer, seed: number): number;
    (data: string|Buffer, seed: number, callback: (err: Error, res: number) => void): void;
    (data: string, encoding: Encoding, seed: number): number;
    (data: string, encoding: Encoding, seed: number, callback: (err: Error, res: number) => void): void;
}

/**
 * An interface for murmurhash 64/128-bit functions.
 *
 * Functions of this type produce hashes as a hexadecimal string by default
 * and for the "number" output type.
 */
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
    export const murmurHash: MurmurHashFnI;
    export const murmurHash32: MurmurHashFnI;
    export const murmurHash64: MurmurHashFnH;
    export const murmurHash64x64: MurmurHashFnH;
    export const murmurHash64x86: MurmurHashFnH;
    export const murmurHash128: MurmurHashFnH;
    export const murmurHash128x64: MurmurHashFnH;
    export const murmurHash128x86: MurmurHashFnH;
}

export namespace LE {
    export const murmurHash: MurmurHashFnI;
    export const murmurHash32: MurmurHashFnI;
    export const murmurHash64: MurmurHashFnH;
    export const murmurHash64x64: MurmurHashFnH;
    export const murmurHash64x86: MurmurHashFnH;
    export const murmurHash128: MurmurHashFnH;
    export const murmurHash128x64: MurmurHashFnH;
    export const murmurHash128x86: MurmurHashFnH;
}

export namespace platform {
    export const murmurHash: MurmurHashFnI;
    export const murmurHash32: MurmurHashFnI;
    export const murmurHash64: MurmurHashFnH;
    export const murmurHash64x64: MurmurHashFnH;
    export const murmurHash64x86: MurmurHashFnH;
    export const murmurHash128: MurmurHashFnH;
    export const murmurHash128x64: MurmurHashFnH;
    export const murmurHash128x86: MurmurHashFnH;
}
