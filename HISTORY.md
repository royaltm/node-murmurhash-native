v0.2.0

* default input encoding changed from "utf8" to "binary"
* ensure default output type is "number" (32bit) or "buffer" (>32bit)
* decode "utf8" string faster on node >= 0.10
* handle some cases of 3 arguments better
* bench: compare with md5/sha1
* bench: string encoding argument

v0.1.1

* fix handling of non-ascii encoding argument string
