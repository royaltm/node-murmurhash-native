import { Encoding, OutputType, EncodingOrOutputType, MurmurHashHexStr,
         murmurHash64, murmurHash64x86, murmurHash64x64,
         murmurHash128, murmurHash128x86, murmurHash128x64,
         BE, LE, platform } from "../..";

import * as os from "os";

import { test } from "tap";

interface ExpectedOs {
    expected64: Expected,
    expected128: Expected,
    expected64x86: Expected,
    expected64x64: Expected,
    expected128x86: Expected,
    expected128x64: Expected
}

interface Expected {
    hashSize: number,
    result: string,
    resultSeed: string,
    resultHex: string,
    resultSeedHex: string,
    resultBase64: string,
    resultSeedBase64: string,
    encInputResult: string,
    encInputResultSeed: string,
    encInputResultHex: string,
    encInputResultSeedHex: string,
    encInputResultBase64: string,
    encInputResultSeedBase64: string,
    zeroHex: string,
    zeroHex2: string,
    zeroHex3: string,
    result24: number,
    result24Seed: number,
    encInputResult24: number,
    encInputResult24Seed: number
}

const expected64x86BE: Expected = {
    hashSize: 8,
    result: '9be16e24f92c4353',
    resultSeed: '6ccb6838bb690b84',
    resultHex: '9be16e24f92c4353',
    resultSeedHex: '6ccb6838bb690b84',
    resultBase64: 'm+FuJPksQ1M=',
    resultSeedBase64: 'bMtoOLtpC4Q=',
    encInputResult: '8319936e2310a346',
    encInputResultSeed: 'b28016c5d23387e6',
    encInputResultHex: '8319936e2310a346',
    encInputResultSeedHex: 'b28016c5d23387e6',
    encInputResultBase64: 'gxmTbiMQo0Y=',
    encInputResultSeedBase64: 'soAWxdIzh+Y=',
    zeroHex:  '0000000000000000',
    zeroHex2: '000000000000',
    zeroHex3: '0000000000',
    result24: 10215790,
    result24Seed: 7129960,
    encInputResult24: 8591763,
    encInputResult24Seed: 11698198
}

const expected64x86LE: Expected = {
    hashSize: 8,
    result: '53432cf9246ee19b',
    resultSeed: '840b69bb3868cb6c',
    resultHex: '53432cf9246ee19b',
    resultSeedHex: '840b69bb3868cb6c',
    resultBase64: 'U0Ms+SRu4Zs=',
    resultSeedBase64: 'hAtpuzhoy2w=',
    encInputResult: '46a310236e931983',
    encInputResultSeed: 'e68733d2c51680b2',
    encInputResultHex: '46a310236e931983',
    encInputResultSeedHex: 'e68733d2c51680b2',
    encInputResultBase64: 'RqMQI26TGYM=',
    encInputResultSeedBase64: '5ocz0sUWgLI=',
    zeroHex:  '0000000000000000',
    zeroHex2: '000000000000',
    zeroHex3: '0000000000',
    result24: 5456684,
    result24Seed: 8653673,
    encInputResult24: 4629264,
    encInputResult24Seed: 15107891
}

const expected64x64BE: Expected = {
    hashSize: 8,
    result: 'f93cddc69a2f7f16',
    resultSeed: 'a8b3d189d1fdedd6',
    resultHex: 'f93cddc69a2f7f16',
    resultSeedHex: 'a8b3d189d1fdedd6',
    resultBase64: '+TzdxpovfxY=',
    resultSeedBase64: 'qLPRidH97dY=',
    encInputResult: '095b1c6e2b607973',
    encInputResultSeed: 'ffff686aca244a3c',
    encInputResultHex: '095b1c6e2b607973',
    encInputResultSeedHex: 'ffff686aca244a3c',
    encInputResultBase64: 'CVscbitgeXM=',
    encInputResultSeedBase64: '//9oasokSjw=',
    zeroHex:  '0000000000000000',
    zeroHex2: '000000000000',
    zeroHex3: '0000000000',
    result24: 16334045,
    result24Seed: 11056081,
    encInputResult24: 613148,
    encInputResult24Seed: 16777064
}

const expected64x64LE: Expected = {
    hashSize: 8,
    result: '167f2f9ac6dd3cf9',
    resultSeed: 'd6edfdd189d1b3a8',
    resultHex: '167f2f9ac6dd3cf9',
    resultSeedHex: 'd6edfdd189d1b3a8',
    resultBase64: 'Fn8vmsbdPPk=',
    resultSeedBase64: '1u390YnRs6g=',
    encInputResult: '7379602b6e1c5b09',
    encInputResultSeed: '3c4a24ca6a68ffff',
    encInputResultHex: '7379602b6e1c5b09',
    encInputResultSeedHex: '3c4a24ca6a68ffff',
    encInputResultBase64: 'c3lgK24cWwk=',
    encInputResultSeedBase64: 'PEokympo//8=',
    zeroHex:  '0000000000000000',
    zeroHex2: '000000000000',
    zeroHex3: '0000000000',
    result24: 1474351,
    result24Seed: 14085629,
    encInputResult24: 7567712,
    encInputResult24Seed: 3951140
}

const expected128x86BE: Expected = {
    hashSize: 16,
    result: '017b2e639c477ec35f45a23854bdd956',
    resultSeed: '1c1d24b3766cbee3fd13dd8bb03afe8e',
    resultHex: '017b2e639c477ec35f45a23854bdd956',
    resultSeedHex: '1c1d24b3766cbee3fd13dd8bb03afe8e',
    resultBase64: 'AXsuY5xHfsNfRaI4VL3ZVg==',
    resultSeedBase64: 'HB0ks3ZsvuP9E92LsDr+jg==',
    encInputResult: '784ecce5c92da4ace1b02f36e1b02f36',
    encInputResultSeed: '03739803389aff67e2c04948e2c04948',
    encInputResultHex: '784ecce5c92da4ace1b02f36e1b02f36',
    encInputResultSeedHex: '03739803389aff67e2c04948e2c04948',
    encInputResultBase64: 'eE7M5cktpKzhsC824bAvNg==',
    encInputResultSeedBase64: 'A3OYAzia/2fiwElI4sBJSA==',
    zeroHex: '00000000000000000000000000000000',
    zeroHex2: '0000000000000000000000000000',
    zeroHex3: '00000000000000000000000000',
    result24: 97070,
    result24Seed: 1842468,
    encInputResult24: 7884492,
    encInputResult24Seed: 226200
}

const expected128x86LE: Expected = {
    hashSize: 16,
    result: '632e7b01c37e479c38a2455f56d9bd54',
    resultSeed: 'b3241d1ce3be6c768bdd13fd8efe3ab0',
    resultHex: '632e7b01c37e479c38a2455f56d9bd54',
    resultSeedHex: 'b3241d1ce3be6c768bdd13fd8efe3ab0',
    resultBase64: 'Yy57AcN+R5w4okVfVtm9VA==',
    resultSeedBase64: 'syQdHOO+bHaL3RP9jv46sA==',
    encInputResult: 'e5cc4e78aca42dc9362fb0e1362fb0e1',
    encInputResultSeed: '0398730367ff9a384849c0e24849c0e2',
    encInputResultHex: 'e5cc4e78aca42dc9362fb0e1362fb0e1',
    encInputResultSeedHex: '0398730367ff9a384849c0e24849c0e2',
    encInputResultBase64: '5cxOeKykLck2L7DhNi+w4Q==',
    encInputResultSeedBase64: 'A5hzA2f/mjhIScDiSEnA4g==',
    zeroHex: '00000000000000000000000000000000',
    zeroHex2: '0000000000000000000000000000',
    zeroHex3: '00000000000000000000000000',
    result24: 6499963,
    result24Seed: 11740189,
    encInputResult24: 15060046,
    encInputResult24Seed: 235635
}

const expected128x64BE: Expected = {
    hashSize: 16,
    result: '446359de1c29805fa508517dd4794ae5',
    resultSeed: 'b4e3da8506ea610f59dd2bbc5fc0f630',
    resultHex: '446359de1c29805fa508517dd4794ae5',
    resultSeedHex: 'b4e3da8506ea610f59dd2bbc5fc0f630',
    resultBase64: 'RGNZ3hwpgF+lCFF91HlK5Q==',
    resultSeedBase64: 'tOPahQbqYQ9Z3Su8X8D2MA==',
    encInputResult: '91e47a6942c7fed9f94b5041724738b9',
    encInputResultSeed: 'c7b80d2c201de46c0c76494a1da03082',
    encInputResultHex: '91e47a6942c7fed9f94b5041724738b9',
    encInputResultSeedHex: 'c7b80d2c201de46c0c76494a1da03082',
    encInputResultBase64: 'keR6aULH/tn5S1BBckc4uQ==',
    encInputResultSeedBase64: 'x7gNLCAd5GwMdklKHaAwgg==',
    zeroHex: '00000000000000000000000000000000',
    zeroHex2: '0000000000000000000000000000',
    zeroHex3: '00000000000000000000000000',
    result24: 4481881,
    result24Seed: 11854810,
    encInputResult24: 9561210,
    encInputResult24Seed: 13088781
}

const expected128x64LE: Expected = {
    hashSize: 16,
    result: '5f80291cde596344e54a79d47d5108a5',
    resultSeed: '0f61ea0685dae3b430f6c05fbc2bdd59',
    resultHex: '5f80291cde596344e54a79d47d5108a5',
    resultSeedHex: '0f61ea0685dae3b430f6c05fbc2bdd59',
    resultBase64: 'X4ApHN5ZY0TlSnnUfVEIpQ==',
    resultSeedBase64: 'D2HqBoXa47Qw9sBfvCvdWQ==',
    encInputResult: 'd9fec742697ae491b938477241504bf9',
    encInputResultSeed: '6ce41d202c0db8c78230a01d4a49760c',
    encInputResultHex: 'd9fec742697ae491b938477241504bf9',
    encInputResultSeedHex: '6ce41d202c0db8c78230a01d4a49760c',
    encInputResultBase64: '2f7HQml65JG5OEdyQVBL+Q==',
    encInputResultSeedBase64: 'bOQdICwNuMeCMKAdSkl2DA==',
    zeroHex: '00000000000000000000000000000000',
    zeroHex2: '0000000000000000000000000000',
    zeroHex3: '00000000000000000000000000',
    result24: 6258729,
    result24Seed: 1008106,
    encInputResult24: 14286535,
    encInputResult24Seed: 7136285
}

const expBE: ExpectedOs = {
    expected64: os.arch() === 'x64' ? expected64x64BE : expected64x86BE,
    expected128: os.arch() === 'x64' ? expected128x64BE : expected128x86BE,
    expected64x86: expected64x86BE,
    expected64x64: expected64x64BE,
    expected128x86: expected128x86BE,
    expected128x64: expected128x64BE
}

const expLE: ExpectedOs = {
    expected64: os.arch() === 'x64' ? expected64x64LE : expected64x86LE,
    expected128: os.arch() === 'x64' ? expected128x64LE : expected128x86LE,
    expected64x86: expected64x86LE,
    expected64x64: expected64x64LE,
    expected128x86: expected128x86LE,
    expected128x64: expected128x64LE
}

const expOs: ExpectedOs = ((): ExpectedOs => {
    switch(os.endianness()) {
        case 'BE': return expBE;
        case 'LE': return expLE;
        default:
            throw new Error("unsupported endianness");
    }
})();

test("check arguments of murmurHash64", (t) => testMurmurHashHexStr(murmurHash64, expBE.expected64, t));
test("check arguments of BE.murmurHash64", (t) => testMurmurHashHexStr(BE.murmurHash64, expBE.expected64, t));
test("check arguments of LE.murmurHash64", (t) => testMurmurHashHexStr(LE.murmurHash64, expLE.expected64, t));
test("check arguments of platform murmurHash64", (t) => testMurmurHashHexStr(platform.murmurHash64, expOs.expected64, t));
test("check arguments of murmurHash64 w/ callback", (t) => testMurmurHashHexStrCallback(murmurHash64, expBE.expected64, t));
test("check arguments of BE.murmurHash64 w/ callback", (t) => testMurmurHashHexStrCallback(BE.murmurHash64, expBE.expected64, t));
test("check arguments of LE.murmurHash64 w/ callback", (t) => testMurmurHashHexStrCallback(LE.murmurHash64, expLE.expected64, t));
test("check arguments of platform murmurHash64 w/ callback", (t) => testMurmurHashHexStrCallback(platform.murmurHash64, expOs.expected64, t));

test("check arguments of murmurHash64x86", (t) => testMurmurHashHexStr(murmurHash64x86, expected64x86BE, t));
test("check arguments of BE.murmurHash64x86", (t) => testMurmurHashHexStr(BE.murmurHash64x86, expected64x86BE, t));
test("check arguments of LE.murmurHash64x86", (t) => testMurmurHashHexStr(LE.murmurHash64x86, expected64x86LE, t));
test("check arguments of platform murmurHash64x86", (t) => testMurmurHashHexStr(platform.murmurHash64x86, expOs.expected64x86, t));
test("check arguments of murmurHash64x86 w/ callback", (t) => testMurmurHashHexStrCallback(murmurHash64x86, expected64x86BE, t));
test("check arguments of BE.murmurHash64x86 w/ callback", (t) => testMurmurHashHexStrCallback(BE.murmurHash64x86, expected64x86BE, t));
test("check arguments of LE.murmurHash64x86 w/ callback", (t) => testMurmurHashHexStrCallback(LE.murmurHash64x86, expected64x86LE, t));
test("check arguments of platform murmurHash64x86 w/ callback", (t) => testMurmurHashHexStrCallback(platform.murmurHash64x86, expOs.expected64x86, t));

test("check arguments of murmurHash64x64", (t) => testMurmurHashHexStr(murmurHash64x64, expected64x64BE, t));
test("check arguments of BE.murmurHash64x64", (t) => testMurmurHashHexStr(BE.murmurHash64x64, expected64x64BE, t));
test("check arguments of LE.murmurHash64x64", (t) => testMurmurHashHexStr(LE.murmurHash64x64, expected64x64LE, t));
test("check arguments of platform murmurHash64x64", (t) => testMurmurHashHexStr(platform.murmurHash64x64, expOs.expected64x64, t));
test("check arguments of murmurHash64x64 w/ callback", (t) => testMurmurHashHexStrCallback(murmurHash64x64, expected64x64BE, t));
test("check arguments of BE.murmurHash64x64 w/ callback", (t) => testMurmurHashHexStrCallback(BE.murmurHash64x64, expected64x64BE, t));
test("check arguments of LE.murmurHash64x64 w/ callback", (t) => testMurmurHashHexStrCallback(LE.murmurHash64x64, expected64x64LE, t));
test("check arguments of platform murmurHash64x64 w/ callback", (t) => testMurmurHashHexStrCallback(platform.murmurHash64x64, expOs.expected64x64, t));

test("check arguments of murmurHash128", (t) => testMurmurHashHexStr(murmurHash128, expBE.expected128, t));
test("check arguments of BE.murmurHash128", (t) => testMurmurHashHexStr(BE.murmurHash128, expBE.expected128, t));
test("check arguments of LE.murmurHash128", (t) => testMurmurHashHexStr(LE.murmurHash128, expLE.expected128, t));
test("check arguments of platform murmurHash128", (t) => testMurmurHashHexStr(platform.murmurHash128, expOs.expected128, t));
test("check arguments of murmurHash128 w/ callback", (t) => testMurmurHashHexStrCallback(murmurHash128, expBE.expected128, t));
test("check arguments of BE.murmurHash128 w/ callback", (t) => testMurmurHashHexStrCallback(BE.murmurHash128, expBE.expected128, t));
test("check arguments of LE.murmurHash128 w/ callback", (t) => testMurmurHashHexStrCallback(LE.murmurHash128, expLE.expected128, t));
test("check arguments of platform murmurHash128 w/ callback", (t) => testMurmurHashHexStrCallback(platform.murmurHash128, expOs.expected128, t));

test("check arguments of murmurHash128x86", (t) => testMurmurHashHexStr(murmurHash128x86, expected128x86BE, t));
test("check arguments of BE.murmurHash128x86", (t) => testMurmurHashHexStr(BE.murmurHash128x86, expected128x86BE, t));
test("check arguments of LE.murmurHash128x86", (t) => testMurmurHashHexStr(LE.murmurHash128x86, expected128x86LE, t));
test("check arguments of platform murmurHash128x86", (t) => testMurmurHashHexStr(platform.murmurHash128x86, expOs.expected128x86, t));
test("check arguments of murmurHash128x86 w/ callback", (t) => testMurmurHashHexStrCallback(murmurHash128x86, expected128x86BE, t));
test("check arguments of BE.murmurHash128x86 w/ callback", (t) => testMurmurHashHexStrCallback(BE.murmurHash128x86, expected128x86BE, t));
test("check arguments of LE.murmurHash128x86 w/ callback", (t) => testMurmurHashHexStrCallback(LE.murmurHash128x86, expected128x86LE, t));
test("check arguments of platform murmurHash128x86 w/ callback", (t) => testMurmurHashHexStrCallback(platform.murmurHash128x86, expOs.expected128x86, t));

test("check arguments of murmurHash128x64", (t) => testMurmurHashHexStr(murmurHash128x64, expected128x64BE, t));
test("check arguments of BE.murmurHash128x64", (t) => testMurmurHashHexStr(BE.murmurHash128x64, expected128x64BE, t));
test("check arguments of LE.murmurHash128x64", (t) => testMurmurHashHexStr(LE.murmurHash128x64, expected128x64LE, t));
test("check arguments of platform murmurHash128x64", (t) => testMurmurHashHexStr(platform.murmurHash128x64, expOs.expected128x64, t));
test("check arguments of murmurHash128x64 w/ callback", (t) => testMurmurHashHexStrCallback(murmurHash128x64, expected128x64BE, t));
test("check arguments of BE.murmurHash128x64 w/ callback", (t) => testMurmurHashHexStrCallback(BE.murmurHash128x64, expected128x64BE, t));
test("check arguments of LE.murmurHash128x64 w/ callback", (t) => testMurmurHashHexStrCallback(LE.murmurHash128x64, expected128x64LE, t));
test("check arguments of platform murmurHash128x64 w/ callback", (t) => testMurmurHashHexStrCallback(platform.murmurHash128x64, expOs.expected128x64, t));

function testMurmurHashHexStr(murmurHash: MurmurHashHexStr, expected: Expected, t: any): void {
    // murmurHash(data)
    t.strictEqual(murmurHash("deadbacaca"), expected.result);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca")), expected.result);
    // murmurHash(data, output[, offset[, length]])
    let buf: Buffer = Buffer.alloc(2*expected.hashSize);
    t.strictEqual(murmurHash("deadbacaca", buf), buf);
    t.strictEqual(buf.toString('hex', 0, expected.hashSize), expected.result);
    t.strictEqual(buf.toString('hex', expected.hashSize), expected.zeroHex);
    buf.fill(0);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), buf), buf);
    t.strictEqual(buf.toString('hex', 0, expected.hashSize), expected.result);
    t.strictEqual(buf.toString('hex', expected.hashSize), expected.zeroHex);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", buf, 2), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.toString('hex', 2, 2 + expected.hashSize), expected.result);
    t.strictEqual(buf.toString('hex', 2 + expected.hashSize), expected.zeroHex2);
    buf.fill(0);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), buf, 2), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.toString('hex', 2, 2 + expected.hashSize), expected.result);
    t.strictEqual(buf.toString('hex', 2 + expected.hashSize), expected.zeroHex2);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", buf, 2, 3), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.readUIntBE(2, 3), expected.result24);
    t.strictEqual(buf.toString('hex', 2 + 3, 2 + expected.hashSize), expected.zeroHex3);
    t.strictEqual(buf.toString('hex', expected.hashSize), expected.zeroHex);
    buf.fill(0);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), buf, 2, 3), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.readUIntBE(2, 3), expected.result24);
    t.strictEqual(buf.toString('hex', 2 + 3, 2 + expected.hashSize), expected.zeroHex3);
    t.strictEqual(buf.toString('hex', expected.hashSize), expected.zeroHex);
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
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.result);
    }
    {
        let res = murmurHash("deadbacaca", "buffer", 123456) as Buffer;
        t.type(res, Buffer);
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.resultSeed);
    }
    // murmurHash(data{Buffer}, output_type[, seed])
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex"), expected.resultHex);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex", 123456), expected.resultSeedHex);
    {
        let res = murmurHash(Buffer.from("deadbacaca"), "buffer") as Buffer;
        t.type(res, Buffer);
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.result);
    }
    {
        let res = murmurHash(Buffer.from("deadbacaca"), "buffer", 123456) as Buffer;
        t.type(res, Buffer);
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.resultSeed);
    }
    // murmurHash(data, seed)
    t.strictEqual(murmurHash("deadbacaca", 123456), expected.resultSeed);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456), expected.resultSeed);
    // murmurHash(data, seed, output[, offset[, length]])
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", 123456, buf), buf);
    t.strictEqual(buf.toString('hex', 0, expected.hashSize), expected.resultSeed);
    t.strictEqual(buf.toString('hex', expected.hashSize), expected.zeroHex);
    buf.fill(0);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, buf), buf);
    t.strictEqual(buf.toString('hex', 0, expected.hashSize), expected.resultSeed);
    t.strictEqual(buf.toString('hex', expected.hashSize), expected.zeroHex);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", 123456, buf, 2), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.toString('hex', 2, 2 + expected.hashSize), expected.resultSeed);
    t.strictEqual(buf.toString('hex', 2 + expected.hashSize), expected.zeroHex2);
    buf.fill(0);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, buf, 2), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.toString('hex', 2, 2 + expected.hashSize), expected.resultSeed);
    t.strictEqual(buf.toString('hex', 2 + expected.hashSize), expected.zeroHex2);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", 123456, buf, 2, 3), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.readUIntBE(2, 3), expected.result24Seed);
    t.strictEqual(buf.toString('hex', 2 + 3, 2 + expected.hashSize), expected.zeroHex3);
    t.strictEqual(buf.toString('hex', expected.hashSize), expected.zeroHex);
    buf.fill(0);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, buf, 2, 3), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.readUIntBE(2, 3), expected.result24Seed);
    t.strictEqual(buf.toString('hex', 2 + 3, 2 + expected.hashSize), expected.zeroHex3);
    t.strictEqual(buf.toString('hex', expected.hashSize), expected.zeroHex);
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
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.resultSeed);
    }
    {
        let res = murmurHash(Buffer.from("deadbacaca"), 123456, "buffer") as Buffer;
        t.type(res, Buffer);
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.resultSeed);
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
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.encInputResult);
    }
    {
        let res = murmurHash(Buffer.from("deadbacaca"), "hex", "buffer") as Buffer; // input encoding ignored
        t.type(res, Buffer);
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.result);
    }
    // murmurHash(data{string}, encoding, output[, offset[, length]])
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", "hex", buf), buf);
    t.strictEqual(buf.toString('hex', 0, expected.hashSize), expected.encInputResult);
    t.strictEqual(buf.toString('hex', expected.hashSize), expected.zeroHex);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", "hex", buf, 2), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.toString('hex', 2, 2 + expected.hashSize), expected.encInputResult);
    t.strictEqual(buf.toString('hex', 2 + expected.hashSize), expected.zeroHex2);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", "hex", buf, 2, 3), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.readUIntBE(2, 3), expected.encInputResult24);
    t.strictEqual(buf.toString('hex', 2 + 3, 2 + expected.hashSize), expected.zeroHex3);
    t.strictEqual(buf.toString('hex', expected.hashSize), expected.zeroHex);
    // murmurHash(data{string}, encoding, seed)
    t.strictEqual(murmurHash("deadbacaca", "ascii", 123456), expected.resultSeed);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456), expected.encInputResultSeed);
    // murmurHash(data{string}, encoding, seed, output[, offset[, length]])
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, buf), buf);
    t.strictEqual(buf.toString('hex', 0, expected.hashSize), expected.encInputResultSeed);
    t.strictEqual(buf.toString('hex', expected.hashSize), expected.zeroHex);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, buf, 2), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.toString('hex', 2, 2 + expected.hashSize), expected.encInputResultSeed);
    t.strictEqual(buf.toString('hex', 2 + expected.hashSize), expected.zeroHex2);
    buf.fill(0);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, buf, 2, 3), buf);
    t.strictEqual(buf.readUInt16BE(0), 0);
    t.strictEqual(buf.readUIntBE(2, 3), expected.encInputResult24Seed);
    t.strictEqual(buf.toString('hex', 2 + 3, 2 + expected.hashSize), expected.zeroHex3);
    t.strictEqual(buf.toString('hex', expected.hashSize), expected.zeroHex);
    // murmurHash(data{string}, encoding, seed, output_type)
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, "number"), expected.encInputResultSeed);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, "hex"), expected.encInputResultSeedHex);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, "base64"), expected.encInputResultSeedBase64);
    {
        let res = murmurHash("deadbacaca", "hex", 123456, "buffer") as Buffer;
        t.type(res, Buffer);
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.encInputResultSeed);
    }
    t.end();
}

function testMurmurHashHexStrCallback(murmurHash: MurmurHashHexStr, expected: Expected, t: any): void {
    t.plan(240);
    // murmurHash(data, callback)
    t.strictEqual(murmurHash("deadbacaca", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.result);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.result);
    }), undefined);
    // murmurHash(data, output[, offset[, length]], callback)
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash("deadbacaca", buf, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.toString('hex', 0, expected.hashSize), expected.result);
            t.strictEqual(res.toString('hex', expected.hashSize), expected.zeroHex);
        }));
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash(Buffer.from("deadbacaca"), buf, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.toString('hex', 0, expected.hashSize), expected.result);
            t.strictEqual(res.toString('hex', expected.hashSize), expected.zeroHex);
        }));
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash("deadbacaca", buf, 2, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.toString('hex', 2, 2 + expected.hashSize), expected.result);
            t.strictEqual(res.toString('hex', 2 + expected.hashSize), expected.zeroHex2);
        }));
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash(Buffer.from("deadbacaca"), buf, 2, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.toString('hex', 2, 2 + expected.hashSize), expected.result);
            t.strictEqual(res.toString('hex', 2 + expected.hashSize), expected.zeroHex2);
        }));
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash("deadbacaca", buf, 2, 3, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.readUIntBE(2, 3), expected.result24);
            t.strictEqual(res.toString('hex', 2 + 3, 2 + expected.hashSize), expected.zeroHex3);
            t.strictEqual(res.toString('hex', expected.hashSize), expected.zeroHex);
        }));
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash(Buffer.from("deadbacaca"), buf, 2, 3, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.readUIntBE(2, 3), expected.result24);
            t.strictEqual(res.toString('hex', 2 + 3, 2 + expected.hashSize), expected.zeroHex3);
            t.strictEqual(res.toString('hex', expected.hashSize), expected.zeroHex);
        }));
    }
    // murmurHash(data{String}, encoding|output_type[, seed], callback)
    t.strictEqual(murmurHash("deadbacaca", "ascii", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.result);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "ascii", 123456, (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeed);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "hex", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.encInputResult);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.encInputResultSeed);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "number", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.result);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "number", 123456, (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeed);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "buffer", (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.result);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "buffer", 123456, (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.resultSeed);
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
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.result);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "buffer", 123456, (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.resultSeed);
    }), undefined);
    // murmurHash(data, seed, callback)
    t.strictEqual(murmurHash("deadbacaca", 123456, (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeed);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeed);
    }), undefined);
    // murmurHash(data, seed, output[, offset[, length]], callback)
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash("deadbacaca", 123456, buf, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.toString('hex', 0, expected.hashSize), expected.resultSeed);
            t.strictEqual(res.toString('hex', expected.hashSize), expected.zeroHex);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, buf, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.toString('hex', 0, expected.hashSize), expected.resultSeed);
            t.strictEqual(res.toString('hex', expected.hashSize), expected.zeroHex);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash("deadbacaca", 123456, buf, 2, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.toString('hex', 2, 2 + expected.hashSize), expected.resultSeed);
            t.strictEqual(res.toString('hex', 2 + expected.hashSize), expected.zeroHex2);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, buf, 2, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.toString('hex', 2, 2 + expected.hashSize), expected.resultSeed);
            t.strictEqual(res.toString('hex', 2 + expected.hashSize), expected.zeroHex2);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash("deadbacaca", 123456, buf, 2, 3, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.readUIntBE(2, 3), expected.result24Seed);
            t.strictEqual(res.toString('hex', 2 + 3, 2 + expected.hashSize), expected.zeroHex3);
            t.strictEqual(res.toString('hex', expected.hashSize), expected.zeroHex);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, buf, 2, 3, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.readUIntBE(2, 3), expected.result24Seed);
            t.strictEqual(res.toString('hex', 2 + 3, 2 + expected.hashSize), expected.zeroHex3);
            t.strictEqual(res.toString('hex', expected.hashSize), expected.zeroHex);
        }), undefined);
    }
    // murmurHash(data, seed, output_type, callback)
    t.strictEqual(murmurHash("deadbacaca", 123456, "number", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeed);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, "number", (err: Error, res: string) => {
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
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.resultSeed);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), 123456, "buffer", (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.resultSeed);
    }), undefined);
    // murmurHash(data, encoding, output_type)
    t.strictEqual(murmurHash("deadbacaca", "hex", "number", (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.encInputResult);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex", "number", (err: Error, res: string) => {
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
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.encInputResult);
    }), undefined);
    t.strictEqual(murmurHash(Buffer.from("deadbacaca"), "hex", "buffer", (err: Error, res: Buffer) => {
        t.error(err);
        t.type(res, Buffer);
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.result); // input encoding ignored
    }), undefined);
    // murmurHash(data{string}, encoding, output[, offset[, length]])
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash("deadbacaca", "hex", buf, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.toString('hex', 0, expected.hashSize), expected.encInputResult);
            t.strictEqual(res.toString('hex', expected.hashSize), expected.zeroHex);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash("deadbacaca", "hex", buf, 2, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.toString('hex', 2, 2 + expected.hashSize), expected.encInputResult);
            t.strictEqual(res.toString('hex', 2 + expected.hashSize), expected.zeroHex2);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash("deadbacaca", "hex", buf, 2, 3, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.readUIntBE(2, 3), expected.encInputResult24);
            t.strictEqual(res.toString('hex', 2 + 3, 2 + expected.hashSize), expected.zeroHex3);
            t.strictEqual(res.toString('hex', expected.hashSize), expected.zeroHex);
        }), undefined);
    }
    // murmurHash(data{string}, encoding, seed, callback)
    t.strictEqual(murmurHash("deadbacaca", "ascii", 123456, (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.resultSeed);
    }), undefined);
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, (err: Error, res: string) => {
        t.error(err);
        t.strictEqual(res, expected.encInputResultSeed);
    }), undefined);
    // murmurHash(data{string}, encoding, seed, output[, offset[, length]], callback)
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash("deadbacaca", "hex", 123456, buf, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.toString('hex', 0, expected.hashSize), expected.encInputResultSeed);
            t.strictEqual(res.toString('hex', expected.hashSize), expected.zeroHex);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash("deadbacaca", "hex", 123456, buf, 2, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.toString('hex', 2, 2 + expected.hashSize), expected.encInputResultSeed);
            t.strictEqual(res.toString('hex', 2 + expected.hashSize), expected.zeroHex2);
        }), undefined);
    }
    {
        let buf: Buffer = Buffer.alloc(2*expected.hashSize);
        t.strictEqual(murmurHash("deadbacaca", "hex", 123456, buf, 2, 3, (err: Error, res: Buffer) => {
            t.error(err);
            t.strictEqual(buf, res);
            t.strictEqual(res.readUInt16BE(0), 0);
            t.strictEqual(res.readUIntBE(2, 3), expected.encInputResult24Seed);
            t.strictEqual(res.toString('hex', 2 + 3, 2 + expected.hashSize), expected.zeroHex3);
            t.strictEqual(res.toString('hex', expected.hashSize), expected.zeroHex);
        }), undefined);
    }
    // murmurHash(data{string}, encoding, seed, output_type, callback)
    t.strictEqual(murmurHash("deadbacaca", "hex", 123456, "number", (err: Error, res: string) => {
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
        t.strictEqual(res.length, expected.hashSize);
        t.strictEqual(res.toString('hex'), expected.encInputResultSeed);
    }), undefined);
}
