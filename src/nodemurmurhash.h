#if !defined(NODEMURMURHASH_HEADER)
#define NODEMURMURHASH_HEADER

#include <node.h>
#include <node_buffer.h>
#include <v8.h>
#include <nan.h>
#include <string.h>

#ifdef _MSC_VER
#  define strncasecmp _strnicmp
#  define strcasecmp _stricmp
#endif

#ifndef NanEncode
#  if NODE_VERSION_AT_LEAST(0,11,12)
#    define NanEncode(buf, buflen, encoding) \
    node::Encode(v8::Isolate::GetCurrent(), buf, buflen, encoding)
#  else
#    define NanEncode(buf, buflen, encoding) \
    node::Encode(buf, buflen, encoding)
#  endif
#endif

#ifndef NanDecodeBytes
#  if NODE_VERSION_AT_LEAST(0,11,12)
#    define NanDecodeBytes(val, encoding) \
    node::DecodeBytes(v8::Isolate::GetCurrent(), val, encoding)
#  else
#    define NanDecodeBytes(val, encoding) \
    node::DecodeBytes(val, encoding)
#  endif
#endif

#ifndef NanDecodeWrite
#  if NODE_VERSION_AT_LEAST(0,11,12)
#    define NanDecodeWrite(buf, buflen, val, encoding) \
    node::DecodeWrite(v8::Isolate::GetCurrent(), buf, buflen, val, encoding)
#  else
#    define NanDecodeWrite(buf, buflen, val, encoding) \
    node::DecodeWrite(buf, buflen, val, encoding)
#  endif
#endif

#endif