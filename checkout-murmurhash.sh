#!/bin/sh

mkdir -p src/murmurhash
cd src/murmurhash
exec curl 'https://raw.githubusercontent.com/aappleby/smhasher/master/src/MurmurHash{2,3}.{cpp,h}' -O -f
