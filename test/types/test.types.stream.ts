// import * as os from "os";

import { getHashes, createHash } from "../../stream";

import { test } from "tap";

test("shoud have algorithms", (t) => {
    let hashes = getHashes();
    t.type(hashes, Array);
    t.deepEqual(hashes.sort(), [
        "murmurhash",
        "murmurhash128",
        "murmurhash128x64",
        "murmurhash128x86"]);
    t.end();
});

test("should have stream and hasher methods", (t) => {
    t.plan(4);
    let hasher = createHash("murmurhash");
    t.strictEqual(hasher.digest('number'), 0);
    hasher.setEncoding('hex');
    hasher.write("dead");
    hasher.end("bacaca");
    hasher.once('readable', () => {
        t.strictEqual(hasher.endianness, "BE");
        hasher.endianness = "LE";
        t.strictEqual(hasher.endianness, "LE");
        t.strictEqual(hasher.read(), "7481d57a");
    });
});

test("should create hash with options", (t) => {
    t.plan(13);
    let hasher = createHash("murmurhash", {endianness: "LE", seed: 123456});
    t.strictEqual(hasher.endianness, "LE");
    t.strictEqual(hasher.update("dead", "hex"), hasher);
    t.strictEqual(hasher.digest("number"), 3787564060);
    t.strictEqual(hasher.digest("hex"), "1ca4c1e1");
    let serial = hasher.toJSON();
    t.type(serial, Object);
    hasher = createHash(serial);
    t.strictEqual(hasher.endianness, "BE");
    t.strictEqual(hasher.digest("number"), 3787564060);
    t.strictEqual(hasher.digest("hex"), "e1c1a41c");
    hasher = createHash(serial, {endianness: "LE"});
    t.strictEqual(hasher.endianness, "LE");
    t.strictEqual(hasher.digest("number"), 3787564060);
    t.strictEqual(hasher.digest("hex"), "1ca4c1e1");
    let hasher2 = createHash(hasher);
    hasher.setEncoding('base64');
    hasher.end("bacaca", "hex");
    hasher.once('readable', () => {
        t.strictEqual(hasher.read(), "VuqQLQ==");
    });
    hasher2.setEncoding('base64');
    hasher2.end("bacaca", "hex");
    hasher2.once('readable', () => {
        t.strictEqual(hasher2.read(), "VuqQLQ==");
    });
});
