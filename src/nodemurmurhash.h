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

typedef void (*MurmurHashFunctionType)(const void *, int, uint32_t, void *);

#define HashSize (static_cast<int32_t>(sizeof(HashValueType) * HashLength))

namespace MurmurHash {
  typedef enum {
    DefaultOutputType,
    NumberOutputType,
    HexStringOutputType,
    BinaryStringOutputType,
    Base64StringOutputType,
    BufferOutputType,
    ProvidedBufferOutputType,
    UnknownOutputType,
  } OutputType;
}

#endif