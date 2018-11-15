/**
 * `murmurhash-native/promisify` module.
 *
 * Example:
 *
 * ```ts
 * import * as promisify from "murmurhash-native/promisify"
 *
 * const { murmurHash128x64Async } = promisify()
 * murmurHash128x64Async("hash me!", 42).then(hash => console.log(hash))
 * ```
 *
 * @module promisify
 */

/***/
import { Encoding, OutputType } from "./index"

declare namespace promisify {
    /** An interface for promisified murmurhash functions */
    export interface MurmurHashFnAsync {
        (data: string|Buffer): PromiseLike<number|string>;
        (data: string|Buffer, output: Buffer, offset?: number, length?: number): PromiseLike<Buffer>;
        (data: string, encOrOutType: Encoding|OutputType, seed?: number): PromiseLike<number|string|Buffer>;
        (data: Buffer, outputType: OutputType, seed?: number): PromiseLike<number|string|Buffer>;
        (data: string|Buffer, seed: number): PromiseLike<number|string>;
        (data: string|Buffer, seed: number, output: Buffer, offset?: number, length?: number): PromiseLike<Buffer>;
        (data: string|Buffer, seed: number, outputType: OutputType): PromiseLike<number|string|Buffer>;
        (data: string|Buffer, encoding: Encoding, outputType: OutputType): PromiseLike<number|string|Buffer>;
        (data: string, encoding: Encoding, output: Buffer, offset?: number, length?: number): PromiseLike<Buffer>;
        (data: string, encoding: Encoding, seed: number): PromiseLike<number|string>;
        (data: string, encoding: Encoding, seed: number, output: Buffer, offset?: number, length?: number): PromiseLike<Buffer>;
        (data: string, encoding: Encoding, seed: number, outputType: OutputType): PromiseLike<number|string|Buffer>;
    }
    /** An interface for promisified murmurhash 32-bit functions */
    export interface MurmurHashFnAsyncI extends MurmurHashFnAsync {
        (data: string|Buffer): PromiseLike<number>;
        (data: string|Buffer, seed: number): PromiseLike<number>;
        (data: string, encoding: Encoding, seed: number): PromiseLike<number>;
    }
    /** An interface for promisified murmurhash 64/128-bit functions */
    export interface MurmurHashFnAsyncH extends MurmurHashFnAsync {
        (data: string|Buffer): PromiseLike<string>;
        (data: string, encOrOutType: Encoding|OutputType, seed?: number): PromiseLike<string|Buffer>;
        (data: Buffer, outputType: OutputType, seed?: number): PromiseLike<string|Buffer>;
        (data: string|Buffer, seed: number): PromiseLike<string>;
        (data: string|Buffer, seed: number, outputType: OutputType): PromiseLike<string|Buffer>;
        (data: string|Buffer, encoding: Encoding, outputType: OutputType): PromiseLike<string|Buffer>;
        (data: string, encoding: Encoding, seed: number): PromiseLike<string>;
        (data: string, encoding: Encoding, seed: number, outputType: OutputType): PromiseLike<string|Buffer>;
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
    }

    export interface MurmurHashAsyncNsRoot extends MurmurHashAsyncNs {
        readonly BE: MurmurHashAsyncNs;
        readonly LE: MurmurHashAsyncNs;
        readonly platform: MurmurHashAsyncNs;
    }
}
/**
 * Returns all promisified murmur hash functions in their corresponding namespaces.
 *
 * @param promise optional Promise constructor
 */
declare function promisify(promise?: PromiseConstructorLike): promisify.MurmurHashAsyncNsRoot;

export = promisify;
