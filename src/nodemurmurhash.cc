#include <stdio.h>
#include <stdlib.h>
#include "nodemurmurhash.h"
#include "inputdata.h"
#include "MurmurHash2.h"
#include "MurmurHash3.h"

#define NODE_MURMURHASH_HASH_BUFFER_SIZE 16


#ifdef NODE_MURMURHASH_DEFAULT_32BIT
#  define MurmurHash2_64  MurmurHash2_x86_64
#  define MurmurHash3_128 MurmurHash3_x86_128
#else
#  define MurmurHash2_64  MurmurHash2_x64_64
#  define MurmurHash3_128 MurmurHash3_x64_128
#endif

typedef void (*MurmurHashFunctionType)(const void *, int, uint32_t, void *);

NAN_INLINE void MurmurHash2_x64_64 (
    const void * key, int len, uint32_t seed, void * out)
{
  *(uint64_t *)out = MurmurHash64A( key, len, (uint64_t) seed );
}

NAN_INLINE void MurmurHash2_x86_64 (
    const void * key, int len, uint32_t seed, void * out)
{
  *(uint64_t *)out = MurmurHash64B( key, len, (uint64_t) seed );
}

namespace MurmurHash {
  using v8::Handle;
  using v8::Local;
  using v8::Value;
  using v8::Object;
  using v8::Int32;
  using v8::Uint32;
  using v8::Function;
  using v8::FunctionTemplate;
  using v8::Persistent;
  using v8::String;

  typedef enum {
    IllegalOutputType,
    NumberOutputType,
    BufferOutputType,
    BinaryOutputType,
    Ucs2OutputType,
    AsciiOutputType,
    Utf8OutputType,
    HexOutputType,
    Base64OutputType
  } OutputType;


  NAN_INLINE static Local<Object> CreateResult(
      const OutputType outputType,
      size_t length,
      void **out)
  {
    NanEscapableScope();

    Local<Object> result;

    static char buffer[NODE_MURMURHASH_HASH_BUFFER_SIZE];

    switch(outputType) {
      case NumberOutputType:
        if ( length == sizeof(uint32_t) ) {
          *out = buffer;
          break;
        }
      case BufferOutputType:
        result = NanNewBufferHandle( (uint32_t) length );
        *out = node::Buffer::Data( result );
        break;
      default:
        *out = buffer;
    }
    return NanEscapeScope(result);
  }

  NAN_INLINE static Local<Value> GetResultFrom(
      const OutputType outputType, const char *data, const size_t length)
  {
    NanEscapableScope();

    Local<Value> result;

    switch(outputType) {
      case NumberOutputType:
        result = NanNew<Int32>( *((int32_t *) data) );
        break;
      case BinaryOutputType:
        result = NanEncode( data, length, Nan::BINARY );
        break;
      case AsciiOutputType:
        result = NanEncode( data, length, Nan::ASCII );
        break;
      case HexOutputType:
        result = NanEncode( data, length, Nan::HEX );
        break;
      case Base64OutputType:
        result = NanEncode( data, length, Nan::BASE64 );
        break;
      case Utf8OutputType:
        result = NanEncode( data, length, Nan::UTF8 );
        break;
      case Ucs2OutputType:
        result = NanEncode( data, length, Nan::UCS2 );
        break;
      default:
        void(0);
    }
    return NanEscapeScope(result);
  }

  static OutputType DetermineOutputType(const Handle<String> type)
  {
    char typeCstr[sizeof("utf-16le")];
    int length = type->Length();

    if ( length > 0 && length <= (int)(sizeof(typeCstr) - 1) ) {

      typeCstr[NanDecodeWrite(typeCstr, sizeof(typeCstr) - 1, type)] = 0;

      if ( length > 6 ) {
        if ( strcasecmp(typeCstr, "utf16le") == 0 ||
             strcasecmp(typeCstr, "utf-16le") == 0 )
          return Ucs2OutputType;
      } else if ( length == 6 ) {
        if ( strcasecmp(typeCstr, "buffer") == 0 ) {
          return BufferOutputType;
        } else if ( strcasecmp(typeCstr, "number") == 0 ) {
          return NumberOutputType;
        } else if ( strcasecmp(typeCstr, "binary") == 0 ) {
          return BinaryOutputType;
        } else if ( strcasecmp(typeCstr, "base64") == 0 ) {
          return Base64OutputType;
        }
      } else if ( length >= 5 ) {
        if ( strcasecmp(typeCstr, "ascii") == 0 ) {
          return AsciiOutputType;
        } else if ( strcasecmp(typeCstr, "utf-8") == 0 ) {
          return Utf8OutputType;
        } else if ( strcasecmp(typeCstr, "ucs-2") == 0 ) {
          return Ucs2OutputType;
        }
      } else if ( length >= 4 ) {
        if ( strcasecmp(typeCstr, "utf8") == 0 ) {
          return Utf8OutputType;
        } else if ( strcasecmp(typeCstr, "ucs2") == 0 ) {
          return Ucs2OutputType;
        }
      } else if ( strcasecmp(typeCstr, "hex") == 0 )
        return HexOutputType;
    }

    return NumberOutputType;
  }

  /**
   * Calculate MurmurHash from data
   *
   * murmurHash(data)
   * murmurHash(data<string>, input_encoding)
   * murmurHash(data<Buffer>, output_type)
   * murmurHash(data, seed[, output_type])
   * murmurHash(data, input_encoding, seed|output_type)
   * murmurHash(data, input_encoding, seed, output_type)
   * 
   * @param {string|Buffer} data - a byte-string to calculate hash from
   * @param {string} input_encoding - input data string encoding, can be:
   *       'utf8', 'ucs2', 'ascii', 'hex', 'base64' or 'binary',
   *       ignored if data is an instance of a Buffer,
   *       default is 'binary'
   * @param {Uint32} seed - murmur hash seed, default is 0
   * @param {string} output_type - how to encode output, can be:
   *       'number' (murmurHash32 only) - a 32-bit integer,
   *       'buffer' - Buffer output,
   *       'utf8', 'ucs2', 'ascii', 'hex', 'base64' or 'binary' - string output,
   *       default is 'number' or 'buffer'
   *
   * @return {number|Buffer|String}
  **/
  template<MurmurHashFunctionType HashFunction, size_t HashSize>
  NAN_METHOD(MurmurHash) {
    NanScope();

    int argc = args.Length();

    InputData data;

    OutputType outputType( NumberOutputType );

    uint32_t seed = 0;

    switch(argc) {
      case 4:
        if ( args[3]->IsString() ) {
          outputType = DetermineOutputType( args[3].As<String>() );
        }
        seed = args[2]->Uint32Value();
        if ( args[1]->IsString() ) {
          data.Setup( args[0], args[1].As<String>() );
        } else {
          data.Setup( args[0] );
        }
        break;
      case 3:
        if ( args[1]->IsString() ) {
          data.Setup( args[0], args[1].As<String>() );
        } else {
          if ( args[1]->IsNumber() )
            seed = args[1]->Uint32Value();
          data.Setup( args[0] );
        }
        if ( args[2]->IsString() ) {
          outputType = DetermineOutputType( args[2].As<String>() );
        } else if ( args[2]->IsNumber() ) {
          seed = args[2]->Uint32Value();
        }
        break;
      case 2:
        if ( args[1]->IsString() ) {
          if ( args[0]->IsString() ) {
            data.Setup( args[0], args[1].As<String>() );
          } else {
            outputType = DetermineOutputType( args[1].As<String>() );
            data.Setup( args[0] );
          }
        } else {
          seed = args[1]->Uint32Value();
          data.Setup( args[0] );
        }
        break;
      case 1:
        data.Setup( args[0] );
        break;
    }

    if ( ! data.IsValid() )
      return NanThrowTypeError("string or Buffer is required");

    if ( outputType == IllegalOutputType)
      return NanThrowError("illegal output type");

    void *out;
    Local<Value> result = CreateResult(outputType, HashSize, &out);

    HashFunction( (const void *) *data, (int) data.length(), seed, out );

    if ( result.IsEmpty() )
      result = GetResultFrom( outputType, (char *)out, HashSize );

    NanReturnValue(result);
  }

  void Init(Handle<Object> exports) {
    NODE_SET_METHOD(exports, "murmurHash",       MurmurHash<MurmurHash3_x86_32, 4>);
    NODE_SET_METHOD(exports, "murmurHash32",     MurmurHash<MurmurHash3_x86_32, 4>);
    NODE_SET_METHOD(exports, "murmurHash128",    MurmurHash<MurmurHash3_128, 16>);
    NODE_SET_METHOD(exports, "murmurHash128x64", MurmurHash<MurmurHash3_x64_128, 16>);
    NODE_SET_METHOD(exports, "murmurHash128x86", MurmurHash<MurmurHash3_x86_128, 16>);
    NODE_SET_METHOD(exports, "murmurHash64",     MurmurHash<MurmurHash2_64, 8>);
    NODE_SET_METHOD(exports, "murmurHash64x64",  MurmurHash<MurmurHash2_x64_64, 8>);
    NODE_SET_METHOD(exports, "murmurHash64x86",  MurmurHash<MurmurHash2_x86_64, 8>);

  }
}

NODE_MODULE(murmurhash, MurmurHash::Init)
