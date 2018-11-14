// import * as os from "os";

import { getHashes, createHash, // MurmurHash, MurmurHashOptions,
       } from "../../stream";

import { test } from "tap";

test("shoud have algorithms", (t) => {
    t.deepEqual(getHashes(), [
        "murmurhash",
        "murmurhash128x64",
        "murmurhash128",
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
