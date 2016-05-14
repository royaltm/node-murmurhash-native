#!/bin/sh

mkdir -p src/murmurhash
cd src/murmurhash
for file in \
    MurmurHash2.cpp \
    MurmurHash2.h \
    MurmurHash3.cpp \
    MurmurHash3.h
do
  if [ ! -e "$file" ]
  then curl "https://raw.githubusercontent.com/aappleby/smhasher/master/src/$file" -O -f
  else echo "$file already exists, skipping"
  fi
done
