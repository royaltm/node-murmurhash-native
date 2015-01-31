#include <algorithm>
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
    NumberOutputType,
    BufferOutputType,
    BinaryOutputType,
    Ucs2OutputType,
    AsciiOutputType,
    Utf8OutputType,
    HexOutputType,
    Base64OutputType,
    ProvidedBufferOutputType
  } OutputType;

  static const OutputType DefaultOutputType = NumberOutputType;

  NAN_INLINE static Local<Value> GetResultFrom(
      const OutputType outputType, const char *data, const ssize_t length)
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

    return DefaultOutputType;
  }

  template<MurmurHashFunctionType HashFunction, ssize_t HashSize>
  NAN_INLINE void MurmurHashBuffer(InputData &data, uint32_t seed,
                                   const Handle<Object> buffer,
                                   ssize_t bufoffset,
                                   ssize_t hashlength)
  {
    ssize_t hashoffset = 0, buflength = (ssize_t) node::Buffer::Length(buffer);

    if ( hashlength < 0 ) { // from the end of hash
      hashoffset = hashlength + HashSize;
      hashlength = -hashlength;
    }

    if ( bufoffset < 0 ) { // from the end of buffer
      bufoffset += buflength;
    }

    if ( hashlength == 0 || buflength <= 0 ||
         bufoffset <= -hashlength || bufoffset >= buflength )
      return; // don't bother

    if ( hashlength == HashSize && bufoffset >= 0 &&
                                   bufoffset + HashSize <= buflength ) {
      /* calculate hash directly into buffer */
      HashFunction( (const void *) *data, (int) data.length(), seed,
                    (void *)(node::Buffer::Data(buffer) + bufoffset) );
    } else {
      /* calculate hash and copy into buffer */
      char outbuf[HashSize];
      HashFunction( (const void *) *data, (int) data.length(), seed, (void *)outbuf );
      if ( bufoffset < 0 ) {
        memcpy( (void *)node::Buffer::Data(buffer),
                (void *)(outbuf + hashoffset - bufoffset),
                std::min(bufoffset + hashlength, buflength) );
      } else {
        memcpy( (void *)(node::Buffer::Data(buffer) + bufoffset),
                (void *)(outbuf + hashoffset),
                std::min(hashlength, buflength - bufoffset) );
      }
    }

  }

  /**
   * Calculate MurmurHash from data
   * 
   * murmurHash(data)
   * murmurHash(data, output[, offset])
   * murmurHash(data{string}, input_encoding)
   * murmurHash(data{Buffer}, output_type)
   * murmurHash(data, seed[, output[, offset[, length]]])
   * murmurHash(data, seed[, output_type])
   * murmurHash(data, input_encoding, output[, offset[, length]])
   * murmurHash(data, input_encoding, output_type)
   * murmurHash(data, input_encoding, seed[, output[, offset[, length]]])
   * murmurHash(data, input_encoding, seed[, output_type])
   * 
   * @param {string|Buffer} data - a byte-string to calculate hash from
   * @param {string} input_encoding - data string encoding, can be:
   *       'utf8', 'ucs2', 'ascii', 'hex', 'base64' or 'binary',
   *       ignored if data is an instance of a Buffer,
   *       default is 'binary'
   * @param {Uint32} seed - murmur hash seed, 0 by default
   * @param {Buffer} output - a Buffer object to write hash bytes to;
   *       the same object will be returned
   * @param {number} offset - start writing into output at offset byte;
   *       negative offset starts from the end of the output buffer
   * @param {number} length - a number of bytes to write from calculated hash;
   *       negative length starts from the end of the hash;
   *       if absolute value of length is greater than the size of a calculated
   *       hash, bytes are written only up to the hash size
   * @param {string} output_type - a string indicating return type:
   *       'number' (murmurHash32 only) - a 32-bit integer,
   *       'buffer' - a new Buffer object,
   *       'utf8', 'ucs2', 'ascii', 'hex', 'base64' or 'binary' - string output,
   *       default is 'number' or 'buffer'
   * 
   * data and output arguments might reference the same Buffer object
   * or buffers referencing the same memory (views).
   * 
   * @return {number|Buffer|String}
  **/
  template<MurmurHashFunctionType HashFunction, ssize_t HashSize>
  NAN_METHOD(MurmurHash)
  {
    NanScope();

    InputData data;

    OutputType outputType( DefaultOutputType );

    uint32_t seed = 0;

    /* parse args */
    int argc = std::min( 6, args.Length() ), output_type_index = argc;

    if ( argc == 1 ) {

      data.Setup( args[0] );

    } else if ( argc >= 2 ) {

      if ( args[1]->IsString() ) { // input_encoding or output_type
        if ( args[0]->IsString() ) { // input_encoding
          data.Setup( args[0], args[1].As<String>() );
          output_type_index = 2; // continue from 2
        } else {
          data.Setup( args[0] ); // ignore input_encoding
          if ( argc == 2 ) { // output_type
            outputType = DetermineOutputType( args[1].As<String>() );
          } else {
            output_type_index = 2; // continue from 2
          }
        }
      } else { // output or seed
        data.Setup( args[0] );
        if ( node::Buffer::HasInstance(args[1]) ) {
          outputType = ProvidedBufferOutputType;
          output_type_index = 1;
        } else {
          seed = args[1]->Uint32Value();
          output_type_index = 2; // continue from 2
        }
      }
      if ( outputType == DefaultOutputType ) { // output_type or output or seed
        for (; output_type_index < argc; ++output_type_index ) {
          if ( args[output_type_index]->IsString() ) {
            outputType = DetermineOutputType( args[output_type_index].As<String>() );
            break;
          } else if ( node::Buffer::HasInstance(args[output_type_index]) ) {
            outputType = ProvidedBufferOutputType;
            break;
          } else if ( args[output_type_index]->IsNumber() ) {
            seed = args[output_type_index]->Uint32Value();
          } else
            break;
        }
      }

    }

    if ( ! data.IsValid() )
      return NanThrowTypeError("string or Buffer is required");

    Local<Value> result;

    switch(outputType) {
      case ProvidedBufferOutputType:
        result = args[output_type_index];
        MurmurHashBuffer<HashFunction, HashSize>(
              data, seed,
              result.As<Object>(),
              output_type_index + 1 < argc
                ? (ssize_t) args[output_type_index + 1]->Int32Value()
                : 0,
              output_type_index + 2 < argc
                ? std::max(
                      -HashSize,
                      std::min(
                        HashSize,
                        (ssize_t) args[output_type_index + 2]->Int32Value() ) )
                : HashSize
              );

        break;

      case NumberOutputType:
        if ( HashSize == sizeof(uint32_t) )
          break;

      case BufferOutputType:
        result = NanNewBufferHandle( (uint32_t) HashSize );
        HashFunction( (const void *) *data, (int) data.length(), seed,
                      (void *)node::Buffer::Data( result.As<Object>() ) );
        break;

      default:
        void(0);
    }

    if ( result.IsEmpty() ) {
      char outbuf[HashSize];
      HashFunction( (const void *) *data, (int) data.length(), seed, (void *)outbuf );
      result = GetResultFrom( outputType, outbuf, HashSize );
    }

    NanReturnValue(result);
  }

  void Init(Handle<Object> exports)
  {
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
