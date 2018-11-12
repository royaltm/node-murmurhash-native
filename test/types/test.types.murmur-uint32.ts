import { Encoding, OutputType, EncodingOrOutputType,
         MurmurHashUint32, murmurHash, murmurHash32, BE, LE, platform } from "../..";

const { test } = require('tap');

interface Expected {
    readResult: string,
    result: number,
    resultSeed: number,
    resultHex: string,
    resultSeedHex: string,
    resultBase64: string,
    resultSeedBase64: string,
    encInputResult: number,
    encInputResultSeed: number,
    encInputResultHex: string,
    encInputResultSeedHex: string,
    encInputResultBase64: string,
    encInputResultSeedBase64: string,
    result24: number,
    result24Seed: number,
    encInputResult24: number,
    encInputResult24Seed: number
}

const expected32BE: Expected = {
    readResult: 'readUInt32BE',
    result: 1954665850,
    resultSeed: 1336289403,
    resultHex: '7481d57a',
    resultSeedHex: '4fa6287b',
    resultBase64: 'dIHVeg==',
    resultSeedBase64: 'T6Yoew==',
    encInputResult: 864439591,
    encInputResultSeed: 764471894,
    encInputResultHex: '33864d27',
    encInputResultSeedHex: '2d90ea56',
    encInputResultBase64: 'M4ZNJw==',
    encInputResultSeedBase64: 'LZDqVg==',
    result24: 7635413,
    result24Seed: 5219880,
    encInputResult24: 3376717,
    encInputResult24Seed: 2986218
}

const expected32LE: Expected = {
    readResult: 'readUInt32LE',
    result: 1954665850,
    resultSeed: 1336289403,
    resultHex: '7ad58174',
    resultSeedHex: '7b28a64f',
    resultBase64: 'etWBdA==',
    resultSeedBase64: 'eyimTw==',
    encInputResult: 864439591,
    encInputResultSeed: 764471894,
    encInputResultHex: '274d8633',
    encInputResultSeedHex: '56ea902d',
    encInputResultBase64: 'J02GMw==',
    encInputResultSeedBase64: 'VuqQLQ==',
    result24: 8050049,
    result24Seed: 8071334,
    encInputResult24: 2575750,
    encInputResult24Seed: 5696144
}

test("check arguments of murmurHash", (t) => testMurmurHash32(murmurHash, expected32BE, t));
test("check arguments of BE.murmurHash", (t) => testMurmurHash32(BE.murmurHash, expected32BE, t));
test("check arguments of LE.murmurHash", (t) => testMurmurHash32(LE.murmurHash, expected32LE, t));
test("check arguments of murmurHash32", (t) => testMurmurHash32(murmurHash32, expected32BE, t));
test("check arguments of BE.murmurHash32", (t) => testMurmurHash32(BE.murmurHash32, expected32BE, t));
test("check arguments of LE.murmurHash32", (t) => testMurmurHash32(LE.murmurHash32, expected32LE, t));
test("check arguments of murmurHash w/ callback", (t) => testMurmurHash32Callback(murmurHash, expected32BE, t));
test("check arguments of BE.murmurHash w/ callback", (t) => testMurmurHash32Callback(BE.murmurHash, expected32BE, t));
test("check arguments of LE.murmurHash w/ callback", (t) => testMurmurHash32Callback(LE.murmurHash, expected32LE, t));
test("check arguments of murmurHash32 w/ callback", (t) => testMurmurHash32Callback(murmurHash32, expected32BE, t));
test("check arguments of BE.murmurHash32 w/ callback", (t) => testMurmurHash32Callback(BE.murmurHash32, expected32BE, t));
test("check arguments of LE.murmurHash32 w/ callback", (t) => testMurmurHash32Callback(LE.murmurHash32, expected32LE, t));

function testMurmurHash32(murmurHash: MurmurHashUint32, expected: Expected, t: any): void {
    // murmurHash(data)
    t.strictEqual(murmurHash("deadbacaca"), expected.result);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca")), expected.result);
    // murmurHash(data, output[, offset[, length]])
    let buf: Buffer = Buffer.alloc(8);
    t.strictEqual(murmurHash("deadbacaca", buf), buf);
    t.strictEqual(buf[expected.readResult](0), expected.result);
    t.strictEqual(buf.readUInt32BE(4), 0);
    buf.fill(0);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), buf), buf);
    t.strictEqual(buf[expected.readResult](0), expected.result);
    t.strictEqual(buf.readUInt32BE(4), 0);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", buf, 2), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf[expected.readResult](2), expected.result);
    t.strictEqual(buf.readUInt16BE(6), 0);
    buf.fill(0);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), buf, 2), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf[expected.readResult](2), expected.result);
    t.strictEqual(buf.readUInt16BE(6), 0);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", buf, 2, 3), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.readUIntBE(2, 3), expected.result24);
    t.strictEqual(buf.readUIntBE(5, 3), 0);
    buf.fill(0);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), buf, 2, 3), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.readUIntBE(2, 3), expected.result24);
    t.strictEqual(buf.readUIntBE(5, 3), 0);
    // murmurHash(data{String}, encoding|output_type[, seed])
    t.strictEqual(murmurHash("deadbacaca", "ascii"), expected.result);
    t.strictEqual(murmurHash("deadbacaca", "ascii", 123456), expected.resultSeed);
    t.strictEqual(murmurHash("deadbacaca", "hex"), expected.encInputResult);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456), expected.encInputResultSeed);
    t.strictEqual(murmurHash("deadbacaca", "number"), expected.result);
    t.strictEqual(murmurHash("deadbacaca", "number", 123456), expected.resultSeed);
    {
        let res = murmurHash("deadbacaca", "buffer") as Buffer;
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.result);
    }
    {
        let res = murmurHash("deadbacaca", "buffer", 123456) as Buffer;
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.resultSeed);
    }
    // murmurHash(data{Buffer}, output_type[, seed])
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex"), expected.resultHex);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex", 123456), expected.resultSeedHex);
    {
        let res = murmurHash(Buffer.from("deadbacaca"), "buffer") as Buffer;
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.result);
    }
    {
        let res = murmurHash(Buffer.from("deadbacaca"), "buffer", 123456) as Buffer;
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.resultSeed);
    }
    // murmurHash(data, seed)
    t.strictEqual(murmurHash("deadbacaca", 123456), expected.resultSeed);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456), expected.resultSeed);
    // murmurHash(data, seed, output[, offset[, length]])
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", 123456, buf), buf);
    t.strictEqual(buf[expected.readResult](0), expected.resultSeed);
    t.strictEqual(buf.readUInt32BE(4), 0);
    buf.fill(0);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, buf), buf);
    t.strictEqual(buf[expected.readResult](0), expected.resultSeed);
    t.strictEqual(buf.readUInt32BE(4), 0);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", 123456, buf, 2), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf[expected.readResult](2), expected.resultSeed);
    t.strictEqual(buf.readUInt16BE(6), 0);
    buf.fill(0);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, buf, 2), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf[expected.readResult](2), expected.resultSeed);
    t.strictEqual(buf.readUInt16BE(6), 0);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", 123456, buf, 2, 3), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.readUIntBE(2, 3), expected.result24Seed);
    t.strictEqual(buf.readUIntBE(5, 3), 0);
    buf.fill(0);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, buf, 2, 3), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.readUIntBE(2, 3), expected.result24Seed);
    t.strictEqual(buf.readUIntBE(5, 3), 0);
    // murmurHash(data, seed, output_type)
    t.strictEqual(murmurHash("deadbacaca", 123456, "number"), expected.resultSeed);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, "number"), expected.resultSeed);
    t.strictEqual(murmurHash("deadbacaca", 123456, "hex"), expected.resultSeedHex);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, "hex"), expected.resultSeedHex);
    t.strictEqual(murmurHash("deadbacaca", 123456, "base64"), expected.resultSeedBase64);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, "base64"), expected.resultSeedBase64);
    {
        let res = murmurHash("deadbacaca", 123456, "buffer") as Buffer;
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.resultSeed);
    }
    {
        let res = murmurHash(Buffer.from("deadbacaca"), 123456, "buffer") as Buffer;
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.resultSeed);
    }
    // murmurHash(data, encoding, output_type)
    t.strictEqual(murmurHash("deadbacaca", "hex", "number"), expected.encInputResult);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex", "number"), expected.result); // input encoding ignored
    t.strictEqual(murmurHash("deadbacaca", "hex", "hex"), expected.encInputResultHex);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex", "hex"), expected.resultHex); // input encoding ignored
    t.strictEqual(murmurHash("deadbacaca", "hex", "base64"), expected.encInputResultBase64);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex", "base64"), expected.resultBase64); // input encoding ignored
    {
        let res = murmurHash("deadbacaca", "hex", "buffer") as Buffer;
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.encInputResult);
    }
    {
        let res = murmurHash(Buffer.from("deadbacaca"), "hex", "buffer") as Buffer; // input encoding ignored
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.result);
    }
    // murmurHash(data{string}, encoding, output[, offset[, length]])
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", "hex", buf), buf);
    t.strictEqual(buf[expected.readResult](0), expected.encInputResult);
    t.strictEqual(buf.readUInt32BE(4), 0);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", "hex", buf, 2), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf[expected.readResult](2), expected.encInputResult);
    t.strictEqual(buf.readUInt16BE(6), 0);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", "hex", buf, 2, 3), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.readUIntBE(2, 3), expected.encInputResult24);
    t.strictEqual(buf.readUIntBE(5, 3), 0);
    // murmurHash(data{string}, encoding, seed)
    t.strictEqual(murmurHash("deadbacaca", "ascii", 123456), expected.resultSeed);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456), expected.encInputResultSeed);
    // murmurHash(data{string}, encoding, seed, output[, offset[, length]])
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, buf), buf);
    t.strictEqual(buf[expected.readResult](0), expected.encInputResultSeed);
    t.strictEqual(buf.readUInt32BE(4), 0);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, buf, 2), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf[expected.readResult](2), expected.encInputResultSeed);
    t.strictEqual(buf.readUInt16BE(6), 0);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, buf, 2, 3), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.readUIntBE(2, 3), expected.encInputResult24Seed);
    t.strictEqual(buf.readUIntBE(5, 3), 0);
    // murmurHash(data{string}, encoding, seed, output_type)
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, "number"), expected.encInputResultSeed);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, "hex"), expected.encInputResultSeedHex);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, "base64"), expected.encInputResultSeedBase64);
    {
        let res = murmurHash("deadbacaca", "hex", 123456, "buffer") as Buffer;
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.encInputResultSeed);
    }
    t.end();
}

function testMurmurHash32Callback(murmurHash: MurmurHashUint32, expected: Expected, t: any): void {
    t.plan(234);
    // murmurHash(data, callback)
    t.strictEqual(murmurHash("deadbacaca", (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.result);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.result);
    }), undefined);
    // murmurHash(data, output[, offset[, length]], callback)
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash("deadbacaca", buf, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res[expected.readResult](0), expected.result);
            t.strictEqual(res.readUInt32BE(4), 0);
        }));
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash(Buffer.from("deadbacaca"), buf, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res[expected.readResult](0), expected.result);
            t.strictEqual(res.readUInt32BE(4), 0);
        }));
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash("deadbacaca", buf, 2, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res[expected.readResult](2), expected.result);
            t.strictEqual(res.readUInt16BE(6), 0);
        }));
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash(Buffer.from("deadbacaca"), buf, 2, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res[expected.readResult](2), expected.result);
            t.strictEqual(res.readUInt16BE(6), 0);
        }));
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash("deadbacaca", buf, 2, 3, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.readUIntBE(2, 3), expected.result24);
            t.strictEqual(res.readUIntBE(5, 3), 0);
        }));
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash(Buffer.from("deadbacaca"), buf, 2, 3, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.readUIntBE(2, 3), expected.result24);
            t.strictEqual(res.readUIntBE(5, 3), 0);
        }));
    }
    // murmurHash(data{String}, encoding|output_type[, seed], callback)
    t.strictEqual(murmurHash("deadbacaca", "ascii", (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.result);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "ascii", 123456, (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeed);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "hex", (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.encInputResult);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.encInputResultSeed);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "number", (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.result);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "number", 123456, (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeed);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "buffer", (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.result);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "buffer", 123456, (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.resultSeed);
    }), undefined);
    // murmurHash(data{Buffer}, output_type[, seed], callback)
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultHex);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex", 123456, (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeedHex);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "buffer", (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.result);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "buffer", 123456, (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.resultSeed);
    }), undefined);
    // murmurHash(data, seed, callback)
    t.strictEqual(murmurHash("deadbacaca", 123456, (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeed);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeed);
    }), undefined);
    // murmurHash(data, seed, output[, offset[, length]], callback)
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash("deadbacaca", 123456, buf, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res[expected.readResult](0), expected.resultSeed);
            t.strictEqual(res.readUInt32BE(4), 0);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, buf, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res[expected.readResult](0), expected.resultSeed);
            t.strictEqual(res.readUInt32BE(4), 0);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash("deadbacaca", 123456, buf, 2, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res[expected.readResult](2), expected.resultSeed);
            t.strictEqual(res.readUInt16BE(6), 0);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, buf, 2, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res[expected.readResult](2), expected.resultSeed);
            t.strictEqual(res.readUInt16BE(6), 0);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash("deadbacaca", 123456, buf, 2, 3, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.readUIntBE(2, 3), expected.result24Seed);
            t.strictEqual(res.readUIntBE(5, 3), 0);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, buf, 2, 3, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.readUIntBE(2, 3), expected.result24Seed);
            t.strictEqual(res.readUIntBE(5, 3), 0);
        }), undefined);
    }
    // murmurHash(data, seed, output_type, callback)
    t.strictEqual(murmurHash("deadbacaca", 123456, "number", (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeed);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, "number", (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeed);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", 123456, "hex", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeedHex);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, "hex", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeedHex);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", 123456, "base64", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeedBase64);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, "base64", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeedBase64);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", 123456, "buffer", (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.resultSeed);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, "buffer", (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.resultSeed);
    }), undefined);
    // murmurHash(data, encoding, output_type)
    t.strictEqual(murmurHash("deadbacaca", "hex", "number", (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.encInputResult);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex", "number", (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.result); // input encoding ignored
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "hex", "hex", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.encInputResultHex);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex", "hex", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultHex); // input encoding ignored
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "hex", "base64", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.encInputResultBase64);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex", "base64", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultBase64); // input encoding ignored
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "hex", "buffer", (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.encInputResult);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex", "buffer", (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.result); // input encoding ignored
    }), undefined);
    // murmurHash(data{string}, encoding, output[, offset[, length]])
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash("deadbacaca", "hex", buf, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res[expected.readResult](0), expected.encInputResult);
            t.strictEqual(res.readUInt32BE(4), 0);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash("deadbacaca", "hex", buf, 2, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res[expected.readResult](2), expected.encInputResult);
            t.strictEqual(res.readUInt16BE(6), 0);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash("deadbacaca", "hex", buf, 2, 3, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.readUIntBE(2, 3), expected.encInputResult24);
            t.strictEqual(res.readUIntBE(5, 3), 0);
        }), undefined);
    }
    // murmurHash(data{string}, encoding, seed, callback)
    t.strictEqual(murmurHash("deadbacaca", "ascii", 123456, (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeed);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.encInputResultSeed);
    }), undefined);
    // murmurHash(data{string}, encoding, seed, output[, offset[, length]], callback)
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash("deadbacaca", "hex", 123456, buf, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res[expected.readResult](0), expected.encInputResultSeed);
            t.strictEqual(res.readUInt32BE(4), 0);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash("deadbacaca", "hex", 123456, buf, 2, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res[expected.readResult](2), expected.encInputResultSeed);
            t.strictEqual(res.readUInt16BE(6), 0);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(8);
        t.strictEqual(murmurHash("deadbacaca", "hex", 123456, buf, 2, 3, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.readUIntBE(2, 3), expected.encInputResult24Seed);
            t.strictEqual(res.readUIntBE(5, 3), 0);
        }), undefined);
    }
    // murmurHash(data{string}, encoding, seed, output_type, callback)
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, "number", (err: Error, res: number) => {
        t.error(err);
        t.strictEqual(res, expected.encInputResultSeed);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, "hex", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.encInputResultSeedHex);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, "base64", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.encInputResultSeedBase64);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, "buffer", (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, 4);
        t.strictEqual(res[expected.readResult](0), expected.encInputResultSeed);
    }), undefined);
}
