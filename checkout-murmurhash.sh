#!/bin/sh

cd src
svn checkout http://smhasher.googlecode.com/svn/trunk/ murmurhash --depth empty
cd murmurhash
svn update MurmurHash2.cpp MurmurHash2.h MurmurHash3.cpp MurmurHash3.h
