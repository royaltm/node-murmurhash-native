import * as os from "os";

import { IMurHasherConstructor, IMurHasherBase,
         MurmurHash,
         MurmurHash128, MurmurHash128x64, MurmurHash128x86
       } from "../../incremental";

import { Test, test } from "tap";

interface Expected {
    hashSize: number,
    zero: number|string,
    zeroHex: string,
    resultBE: number|string,
    resultLE: number|string,
    resultSeed: number|string,
    resultHexBE: string,
    resultHexLE: string,
    resultHexBuf1: string,
    resultHexBuf2: string,
    resultHexBuf3: string,
    encInputResult: number|string,
    encInputResultHexBE: string,
    encInputResultHexLE: string
}

const expected32: Expected = {
    hashSize: 4,
    zero: 0,
    zeroHex: '00000000',
    resultBE: 1954665850,
    resultLE: 1954665850,
    resultSeed: 1336289403,
    resultHexBE: '7481d57a',
    resultHexLE: '7ad58174',
    resultHexBuf1: '7481d57a00000000',
    resultHexBuf2: '747481d57a000000',
    resultHexBuf3: '747481d57a748100',
    encInputResult: 864439591,
    encInputResultHexBE: '33864d27',
    encInputResultHexLE: '274d8633'
}

const expected128x64: Expected = {
    hashSize: 16,
    zero: '00000000000000000000000000000000',
    zeroHex: '00000000000000000000000000000000',
    resultBE: '446359de1c29805fa508517dd4794ae5',
    resultLE: '5f80291cde596344e54a79d47d5108a5',
    resultSeed: 'b4e3da8506ea610f59dd2bbc5fc0f630',
    resultHexBE: '446359de1c29805fa508517dd4794ae5',
    resultHexLE: '5f80291cde596344e54a79d47d5108a5',
    resultHexBuf1: '446359de1c29805fa508517dd4794ae500000000000000000000000000000000',
    resultHexBuf2: '44446359de1c29805fa508517dd4794ae5000000000000000000000000000000',
    resultHexBuf3: '44446359de4463805fa508517dd4794ae5000000000000000000000000000000',
    encInputResult: 'd9fec742697ae491b938477241504bf9',
    encInputResultHexBE: '91e47a6942c7fed9f94b5041724738b9',
    encInputResultHexLE: 'd9fec742697ae491b938477241504bf9'
}

const expected128x86: Expected = {
    hashSize: 16,
    zero: '00000000000000000000000000000000',
    zeroHex: '00000000000000000000000000000000',
    resultBE: '017b2e639c477ec35f45a23854bdd956',
    resultLE: '632e7b01c37e479c38a2455f56d9bd54',
    resultSeed: '1c1d24b3766cbee3fd13dd8bb03afe8e',
    resultHexBE: '017b2e639c477ec35f45a23854bdd956',
    resultHexLE: '632e7b01c37e479c38a2455f56d9bd54',
    resultHexBuf1: '017b2e639c477ec35f45a23854bdd95600000000000000000000000000000000',
    resultHexBuf2: '01017b2e639c477ec35f45a23854bdd956000000000000000000000000000000',
    resultHexBuf3: '01017b2e63017b7ec35f45a23854bdd956000000000000000000000000000000',
    encInputResult: 'e5cc4e78aca42dc9362fb0e1362fb0e1',
    encInputResultHexBE: '784ecce5c92da4ace1b02f36e1b02f36',
    encInputResultHexLE: 'e5cc4e78aca42dc9362fb0e1362fb0e1'
}

const expected128: Expected = os.arch() === 'x64' ? expected128x64 : expected128x86;

test("MurmurHash should have arguments", (t) => testIMurHashArgs(MurmurHash, expected32, t));
test("MurmurHash should have arguments for callback update", (t) => testIMurUpdateCallback(MurmurHash, expected32, t));
test("MurmurHash128 should have arguments", (t) => testIMurHashArgs(MurmurHash128, expected128, t));
test("MurmurHash128 should have arguments for callback update", (t) => testIMurUpdateCallback(MurmurHash128, expected128, t));
test("MurmurHash128x86 should have arguments", (t) => testIMurHashArgs(MurmurHash128x86, expected128x86, t));
test("MurmurHash128x86 should have arguments for callback update", (t) => testIMurUpdateCallback(MurmurHash128x86, expected128x86, t));
test("MurmurHash128x64 should have arguments", (t) => testIMurHashArgs(MurmurHash128x64, expected128x64, t));
test("MurmurHash128x64 should have arguments for callback update", (t) => testIMurUpdateCallback(MurmurHash128x64, expected128x64, t));

function testIMurHashArgs(murmurhasher: IMurHasherConstructor, expected: Expected, t: Test) {
  // constructor();
  let mmh = new murmurhasher();
  t.strictEqual(mmh.SERIAL_BYTE_LENGTH, murmurhasher.SERIAL_BYTE_LENGTH);
  t.strictEqual(mmh.total, 0);
  t.strictEqual(mmh.isBusy, false);
  t.strictEqual(mmh.endianness, "BE");
  let serial0 = Buffer.alloc(mmh.SERIAL_BYTE_LENGTH);
  t.strictEqual(mmh.serialize(serial0), serial0);
  t.type(mmh.digest(), Buffer);
  t.strictEqual((mmh.digest() as Buffer).toString('hex'), expected.zeroHex);
  t.strictEqual((mmh.digest("buffer") as Buffer).toString('hex'), expected.zeroHex);
  t.strictEqual(mmh.digest("number"), expected.zero);
  t.strictEqual(mmh.update('dead'), mmh);
  t.strictEqual(mmh.total, 4);
  t.strictEqual(mmh.update(Buffer.from('baca')), mmh);
  t.strictEqual(mmh.total, 8);
  t.strictEqual(mmh.update('ca'), mmh);
  t.strictEqual(mmh.total, 10);
  t.strictEqual((mmh.digest() as Buffer).toString('hex'), expected.resultHexBE);
  t.strictEqual((mmh.digest("buffer") as Buffer).toString('hex'), expected.resultHexBE);
  t.strictEqual(mmh.digest("hex"), expected.resultHexBE);
  t.strictEqual(mmh.digest("number"), expected.resultBE);
  let digest = Buffer.alloc(expected.hashSize*2);
  t.strictEqual(mmh.digest(digest), digest);
  t.strictEqual(digest.toString('hex'), expected.resultHexBuf1);
  t.strictEqual(mmh.digest(digest, 1), digest);
  t.strictEqual(digest.toString('hex'), expected.resultHexBuf2);
  t.strictEqual(mmh.digest(digest, 5, 2), digest);
  t.strictEqual(digest.toString('hex'), expected.resultHexBuf3);
  mmh.endianness = "LE";
  t.strictEqual(mmh.endianness, "LE");
  t.strictEqual(mmh.digest("number"), expected.resultLE);
  t.strictEqual(mmh.digest("hex"), expected.resultHexLE);
  t.strictEqual((mmh.digest("buffer") as Buffer).toString('hex'), expected.resultHexLE);
  let serial = mmh.serialize();
  t.strictEqual(serial, (mmh as IMurHasherBase).toJSON());
  // constructor(serial: string|Buffer, endianness?: Endianness);
  let mmhclone = new murmurhasher(serial, "LE");
  t.strictEqual(mmhclone.endianness, "LE");
  mmhclone = new murmurhasher(serial);
  t.strictEqual(mmhclone.endianness, "BE");
  t.strictEqual(mmhclone.digest("number"), expected.resultBE);
  let mmh2 = new murmurhasher();
  t.strictEqual(mmh2.digest("number"), expected.zero);
  t.strictEqual(mmh.copy(mmh2), mmh2);
  t.strictEqual(mmh2.digest("number"), expected.resultBE);
  // constructor(hash: IMurHasher, endianness?: Endianness);
  let mmh3 = new murmurhasher(mmh2, "LE");
  t.strictEqual(mmh3.endianness, "LE");
  mmh3 = new murmurhasher(mmh2);
  t.strictEqual(mmh3.endianness, "BE");
  t.strictEqual(mmh3.digest("number"), expected.resultBE);
  // constructor(seed: number, endianness?: Endianness);
  let mmhseed = new murmurhasher(123456, "platform");
  t.strictEqual(mmhseed.endianness, os.endianness());
  mmhseed = new murmurhasher(123456);
  t.strictEqual(mmhseed.endianness, "BE");
  t.strictEqual(mmhseed.update('deadba'), mmhseed);
  t.strictEqual(mmhseed.update('caca'), mmhseed);
  t.strictEqual(mmhseed.digest("number"), expected.resultSeed);
  // constructor(serial: string|Buffer, endianness?: Endianness);
  let mmhser = new murmurhasher(serial0, "LE");
  t.strictEqual(mmhser.endianness, "LE");
  mmhser = new murmurhasher(serial0);
  t.strictEqual(mmhser.endianness, "BE");
  t.strictEqual(new murmurhasher(serial0).copy(mmh), mmh);
  t.strictEqual(mmh.total, 0);
  t.strictEqual(mmh.endianness, "LE");
  t.strictEqual(mmh.update('deadba', 'hex'), mmh);
  t.strictEqual(mmh.total, 3);
  t.strictEqual(mmh.update('caca', 'hex'), mmh);
  t.strictEqual(mmh.total, 5);
  t.strictEqual(mmh.digest("number"), expected.encInputResult);
  t.strictEqual(mmh.digest("hex"), expected.encInputResultHexLE);
  mmh.endianness = "BE";
  t.strictEqual(mmh.endianness, "BE");
  t.strictEqual(mmh.digest("hex"), expected.encInputResultHexBE);
  t.end();
}

function testIMurUpdateCallback(murmurhasher: IMurHasherConstructor, expected: Expected, t: Test) {
  t.plan(11);
  let mmh = new murmurhasher()
  t.strictEqual(mmh.total, 0);
  t.strictEqual(mmh.isBusy, false);
  t.strictEqual(mmh.update(Buffer.from("dead"), (err: Error) => {
    t.error(err);
    t.strictEqual(mmh.isBusy, false);
    t.strictEqual(mmh.update("bacaca", "ascii", (err: Error) => {
      t.error(err);
      t.strictEqual(mmh.isBusy, false);
      t.strictEqual(mmh.digest("hex"), expected.resultHexBE);
    }), undefined);
    t.strictEqual(mmh.isBusy, true);
  }), undefined);
  t.strictEqual(mmh.isBusy, true);
}
