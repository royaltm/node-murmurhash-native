// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/audiosprite/index.d.ts
/// <reference types="node" />

export type OutputType = "buffer"|"number"|"base64"|"binary"|"hex";
export type Encoding = "utf16le"|"utf-16le"|"ucs-2"|"ucs2"|"base64"|"binary"|"ascii"|"utf-8"|"utf8"|"hex";
export type EncodingOrOutputType = "utf16le"|"utf-16le"|"ucs-2"|"ucs2"|"base64"|"binary"|"ascii"|"utf-8"|"utf8"|"hex"|"buffer"|"number";

export interface MurmurHashUint32 {
    (data: string|Buffer): number
    (data: string|Buffer, callback: (err: Error, res: number) => void): void
    (data: string|Buffer, output: Buffer, offset?: number, length?: number): Buffer
    (data: string|Buffer, output: Buffer, callback: (err: Error, res: Buffer) => void): void
    (data: string|Buffer, output: Buffer, offset: number, callback: (err: Error, res: Buffer) => void): void
    (data: string|Buffer, output: Buffer, offset: number, length: number, callback: (err: Error, res: Buffer) => void): void
    (data: string, encOrOutType: EncodingOrOutputType, seed?: number): number|string|Buffer
    (data: string, encOrOutType: EncodingOrOutputType, callback: (err: Error, res: number|string|Buffer) => void): void
    (data: string, encOrOutType: EncodingOrOutputType, seed: number, callback: (err: Error, res: number|string|Buffer) => void): void
    (data: Buffer, outputType: OutputType, seed?: number): number|string|Buffer
    (data: Buffer, outputType: OutputType, callback: (err: Error, res: number|string|Buffer) => void): void
    (data: Buffer, outputType: OutputType, seed: number, callback: (err: Error, res: number|string|Buffer) => void): void
    (data: string|Buffer, seed: number): number
    (data: string|Buffer, seed: number, callback: (err: Error, res: number) => void): void
    (data: string|Buffer, seed: number, output: Buffer, offset?: number, length?: number): Buffer
    (data: string|Buffer, seed: number, output: Buffer, callback: (err: Error, res: Buffer) => void): void
    (data: string|Buffer, seed: number, output: Buffer, offset: number, callback: (err: Error, res: Buffer) => void): void
    (data: string|Buffer, seed: number, output: Buffer, offset: number, length: number, callback: (err: Error, res: Buffer) => void): void
    (data: string|Buffer, seed: number, outputType: OutputType): number|string|Buffer
    (data: string|Buffer, seed: number, outputType: OutputType, callback: (err: Error, res: number|string|Buffer) => void): void
    (data: string|Buffer, encoding: Encoding, outputType: OutputType): number|string|Buffer
    (data: string|Buffer, encoding: Encoding, outputType: OutputType, callback: (err: Error, res: number|string|Buffer) => void): void
    (data: string, encoding: Encoding, output: Buffer, offset?: number, length?: number): Buffer
    (data: string, encoding: Encoding, output: Buffer, callback: (err: Error, res: Buffer) => void): void
    (data: string, encoding: Encoding, output: Buffer, offset: number, callback: (err: Error, res: Buffer) => void): void
    (data: string, encoding: Encoding, output: Buffer, offset: number, length: number, callback: (err: Error, res: Buffer) => void): void
    (data: string, encoding: Encoding, seed: number): number
    (data: string, encoding: Encoding, seed: number, callback: (err: Error, res: number) => void): void
    (data: string, encoding: Encoding, seed: number, output: Buffer, offset?: number, length?: number): Buffer
    (data: string, encoding: Encoding, seed: number, output: Buffer, callback: (err: Error, res: Buffer) => void): void
    (data: string, encoding: Encoding, seed: number, output: Buffer, offset: number, callback: (err: Error, res: Buffer) => void): void
    (data: string, encoding: Encoding, seed: number, output: Buffer, offset: number, length: number, callback: (err: Error, res: Buffer) => void): void
    (data: string, encoding: Encoding, seed: number, outputType: OutputType): number|string|Buffer
    (data: string, encoding: Encoding, seed: number, outputType: OutputType, callback: (err: Error, res: number|string|Buffer) => void): void
}

export interface MurmurHashHexStr {
    (data: string|Buffer): string
    (data: string|Buffer, callback: (err: Error, res: string) => void): void
    (data: string|Buffer, output: Buffer, offset?: number, length?: number): Buffer
    (data: string|Buffer, output: Buffer, callback: (err: Error, res: Buffer) => void): void
    (data: string|Buffer, output: Buffer, offset: number, callback: (err: Error, res: Buffer) => void): void
    (data: string|Buffer, output: Buffer, offset: number, length: number, callback: (err: Error, res: Buffer) => void): void
    (data: string, encOrOutType: EncodingOrOutputType, seed?: number): string|Buffer
    (data: string, encOrOutType: EncodingOrOutputType, callback: (err: Error, res: string|Buffer) => void): void
    (data: string, encOrOutType: EncodingOrOutputType, seed: number, callback: (err: Error, res: string|Buffer) => void): void
    (data: Buffer, outputType: OutputType, seed?: number): string|Buffer
    (data: Buffer, outputType: OutputType, callback: (err: Error, res: string|Buffer) => void): void
    (data: Buffer, outputType: OutputType, seed: number, callback: (err: Error, res: string|Buffer) => void): void
    (data: string|Buffer, seed: number): string
    (data: string|Buffer, seed: number, callback: (err: Error, res: string) => void): void
    (data: string|Buffer, seed: number, output: Buffer, offset?: number, length?: number): Buffer
    (data: string|Buffer, seed: number, output: Buffer, callback: (err: Error, res: Buffer) => void): void
    (data: string|Buffer, seed: number, output: Buffer, offset: number, callback: (err: Error, res: Buffer) => void): void
    (data: string|Buffer, seed: number, output: Buffer, offset: number, length: number, callback: (err: Error, res: Buffer) => void): void
    (data: string|Buffer, seed: number, outputType: OutputType): string|Buffer
    (data: string|Buffer, seed: number, outputType: OutputType, callback: (err: Error, res: string|Buffer) => void): void
    (data: string|Buffer, encoding: Encoding, outputType: OutputType): string|Buffer
    (data: string|Buffer, encoding: Encoding, outputType: OutputType, callback: (err: Error, res: string|Buffer) => void): void
    (data: string, encoding: Encoding, output: Buffer, offset?: number, length?: number): Buffer
    (data: string, encoding: Encoding, output: Buffer, callback: (err: Error, res: Buffer) => void): void
    (data: string, encoding: Encoding, output: Buffer, offset: number, callback: (err: Error, res: Buffer) => void): void
    (data: string, encoding: Encoding, output: Buffer, offset: number, length: number, callback: (err: Error, res: Buffer) => void): void
    (data: string, encoding: Encoding, seed: number): string
    (data: string, encoding: Encoding, seed: number, callback: (err: Error, res: string) => void): void
    (data: string, encoding: Encoding, seed: number, output: Buffer, offset?: number, length?: number): Buffer
    (data: string, encoding: Encoding, seed: number, output: Buffer, callback: (err: Error, res: Buffer) => void): void
    (data: string, encoding: Encoding, seed: number, output: Buffer, offset: number, callback: (err: Error, res: Buffer) => void): void
    (data: string, encoding: Encoding, seed: number, output: Buffer, offset: number, length: number, callback: (err: Error, res: Buffer) => void): void
    (data: string, encoding: Encoding, seed: number, outputType: OutputType): string|Buffer
    (data: string, encoding: Encoding, seed: number, outputType: OutputType, callback: (err: Error, res: string|Buffer) => void): void
}

export const murmurHash: MurmurHashUint32;
export const murmurHash32: MurmurHashUint32;
export const murmurHash64x64: MurmurHashHexStr;
export const murmurHash64x86: MurmurHashHexStr;
export const murmurHash128x64: MurmurHashHexStr;
export const murmurHash128x86: MurmurHashHexStr;
export const murmurHash64: MurmurHashHexStr;
export const murmurHash128: MurmurHashHexStr;

export namespace BE {
    const murmurHash: MurmurHashUint32;
    const murmurHash32: MurmurHashUint32;
    const murmurHash64x64: MurmurHashHexStr;
    const murmurHash64x86: MurmurHashHexStr;
    const murmurHash128x64: MurmurHashHexStr;
    const murmurHash128x86: MurmurHashHexStr;
    const murmurHash64: MurmurHashHexStr;
    const murmurHash128: MurmurHashHexStr;
}

export namespace LE {
    const murmurHash: MurmurHashUint32;
    const murmurHash32: MurmurHashUint32;
    const murmurHash64x64: MurmurHashHexStr;
    const murmurHash64x86: MurmurHashHexStr;
    const murmurHash128x64: MurmurHashHexStr;
    const murmurHash128x86: MurmurHashHexStr;
    const murmurHash64: MurmurHashHexStr;
    const murmurHash128: MurmurHashHexStr;
}

export namespace platform {
    const murmurHash: MurmurHashUint32;
    const murmurHash32: MurmurHashUint32;
    const murmurHash64x64: MurmurHashHexStr;
    const murmurHash64x86: MurmurHashHexStr;
    const murmurHash128x64: MurmurHashHexStr;
    const murmurHash128x86: MurmurHashHexStr;
    const murmurHash64: MurmurHashHexStr;
    const murmurHash128: MurmurHashHexStr;
}

// declare module "stream" {
//   // import { Transform } from "stream";
//   export function createHash(hashType: string, options: any): Transform;
// }
