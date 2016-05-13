#include <algorithm>
#include <stdio.h>
#include <stdlib.h>
#include "nodemurmurhash.h"
#include "inputdata.h"
#include "MurmurHash2.h"
#include "MurmurHash3.h"

#ifdef NODE_MURMURHASH_DEFAULT_32BIT
#  define MurmurHash2_64  MurmurHash2_x86_64
#  define MurmurHash3_128 MurmurHash3_x86_128
#  define MurmurHash3_128Length 4
#  define MurmurHash3_128ValueType uint32_t
#else
#  define MurmurHash2_64  MurmurHash2_x64_64
#  define MurmurHash3_128 MurmurHash3_x64_128
#  define MurmurHash3_128Length 2
#  define MurmurHash3_128ValueType uint64_t
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
    ProvidedBufferOutputType,
    UnknownOutputType,
    DefaultOutputType = NumberOutputType
  } OutputType;

  #define HEXSTR_SIZE 2
  #define HEXSTR_SIZEOF(size) ((size) * HEXSTR_SIZE + 1)

  template<typename T>
  NAN_INLINE static char *ToHexString(T value, char * const out)
  {
    static const char hex[]= "0123456789abcdef";
    char * const endp = out + (sizeof(value) * HEXSTR_SIZE);
    for(char * ptr = endp ; ; value >>= 4) {
      *(--ptr) = hex[value & 0xf];
      if (ptr == out) break;
    }
    return endp;
  }

  template<ssize_t HashLength, typename HashValueType>
  NAN_INLINE static void HashToHexString(const HashValueType * hash, char * out)
  {
    const HashValueType * const valt = hash + HashLength;
    const HashValueType * valp = hash;
    while(valp < valt) {
      out = ToHexString( *(valp++), out );
    }
    *out = '\0';
  }

    static OutputType DetermineOutputType(const Local<String> type)
  {
    char typeCstr[sizeof("number")];
    size_t length = type->Length();

    if ( length == (sizeof(typeCstr) - 1) ) {

      typeCstr[Nan::DecodeWrite(typeCstr, length, type)] = 0;

      if ( strcasecmp(typeCstr, "buffer") == 0 ) {
        return BufferOutputType;
      } else if ( strcasecmp(typeCstr, "number") == 0 ) {
        return NumberOutputType;
      }

    }

    return UnknownOutputType;
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
   * murmurHash(data, output[, offset[, length]])
   * murmurHash(data{String}, encoding)
   * murmurHash(data, output_type)
   * murmurHash(data, seed[, output[, offset[, length]]])
   * murmurHash(data, seed[, output_type])
   * murmurHash(data{String}, encoding, output[, offset[, length]])
   * murmurHash(data{String}, encoding, output_type)
   * murmurHash(data{String}, encoding, seed[, output[, offset[, length]]])
   * murmurHash(data{String}, encoding, seed[, output_type])
   * 
   * @param {string|Buffer} data - a byte-string to calculate hash from
   * @param {string} encoding - data string encoding, should be:
   *       'utf8', 'ucs2', 'ascii', 'hex', 'base64' or 'binary',
   *       default is 'binary'
   * @param {Uint32} seed - murmur hash seed, 0 by default
   * @param {Buffer} output - a Buffer object to write hash bytes to;
   *       the same object will be returned
   *       the order of output bytes is platform dependent
   * @param {number} offset - start writing into output at offset byte;
   *       negative offset starts from the end of the output buffer
   * @param {number} length - a number of bytes to write from calculated hash;
   *       negative length starts from the end of the hash;
   *       if absolute value of length is greater than the size of a calculated
   *       hash, bytes are written only up to the hash size
   * @param {string} output_type - a string indicating return type:
   *       'number' - for murmurHash32 an unsigned 32-bit integer,
   *                  other hashes - a hex number as a string
   *       'buffer' - a new Buffer object;
   *       the default is 'number'
   * 
   * the order of bytes when hash is written to a Buffer is platform dependent
   * 
   * data and output arguments might reference the same Buffer object
   * or buffers referencing the same memory (views).
   * 
   * @return {number|Buffer|String}
  **/
  template<MurmurHashFunctionType HashFunction, typename HashValueType, ssize_t HashLength>
  NAN_METHOD(MurmurHash)
  {
    const ssize_t HashSize = sizeof(HashValueType) * HashLength;
    InputData data;

    OutputType outputType( DefaultOutputType );

    uint32_t seed = 0;

    /* parse args */
    int argc = std::min( 6, info.Length() ), output_type_index = argc;

    if ( argc == 1 ) {

      data.Setup( info[0] );

    } else if ( argc >= 2 ) {

      if ( info[1]->IsString() ) { // input_encoding or output_type
        if ( info[0]->IsString() ) {
          if ( argc == 2 ) { // try output_type
            outputType = DetermineOutputType( info[1].As<String>() );
            if (outputType == UnknownOutputType) { // input_encoding
              outputType = DefaultOutputType; // revert to default
              data.Setup( info[0], info[1].As<String>() );
            } else { // output_type
              data.Setup( info[0] );
            }
          } else { // try input_encoding
            data.Setup( info[0], info[1].As<String>() );
            output_type_index = 2; // continue from 2
          }
        } else {
          data.Setup( info[0] ); // ignore input_encoding
          if ( argc == 2 ) { // output_type
            outputType = DetermineOutputType( info[1].As<String>() );
          } else {
            output_type_index = 2; // continue from 2
          }
        }
      } else { // output or seed
        data.Setup( info[0] );
        if ( node::Buffer::HasInstance(info[1]) ) {
          outputType = ProvidedBufferOutputType;
          output_type_index = 1;
        } else {
          if ( info[1]->IsNumber() )
            seed = Nan::To<uint32_t>(info[1]).FromMaybe(0U);
          output_type_index = 2; // continue from 2
        }
      }
      if ( outputType == DefaultOutputType ) { // output_type or output or seed
        for (; output_type_index < argc; ++output_type_index ) {
          if ( info[output_type_index]->IsNumber() ) {
            seed = Nan::To<uint32_t>(info[output_type_index]).FromMaybe(0U);
          } else if ( info[output_type_index]->IsString() ) {
            outputType = DetermineOutputType( info[output_type_index].As<String>() );
            break;
          } else if ( node::Buffer::HasInstance(info[output_type_index]) ) {
            outputType = ProvidedBufferOutputType;
            break;
          } else
            break;
        }
      }

    }

    if ( ! data.IsValid() )
      return Nan::ThrowTypeError(data.Error());

    Local<Value> result;

    switch(outputType) {
      case ProvidedBufferOutputType:
        result = info[output_type_index];
        MurmurHashBuffer<HashFunction, HashSize>(
              data, seed,
              result.As<Object>(),
              output_type_index + 1 < argc
                ? (ssize_t) Nan::To<int32_t>(info[output_type_index + 1]).FromMaybe(0)
                : 0,
              output_type_index + 2 < argc
                ? std::max(
                      -HashSize,
                      std::min(
                        HashSize,
                        (ssize_t) Nan::To<int32_t>(info[output_type_index + 2]).
                          FromMaybe(static_cast<int32_t>(HashSize)) ) )
                : HashSize
              );

        break;

      case NumberOutputType:
        {
          HashValueType outbuf[HashLength];
          HashFunction( (const void *) *data, (int) data.length(), seed, (void *)outbuf );

          if (HashSize == sizeof(uint32_t)) {
            result = Nan::New<Uint32>( (uint32_t) (*outbuf) );
          } else {
            char str[HEXSTR_SIZEOF(HashSize)];
            HashToHexString<HashLength>( outbuf, str );
            result = Nan::New<String>(str).ToLocalChecked();
          }
        }
        break;

      case BufferOutputType:
        result = Nan::NewBuffer( (uint32_t) HashSize ).ToLocalChecked();
        HashFunction( (const void *) *data, (int) data.length(), seed,
                      (void *)node::Buffer::Data( result.As<Object>() ) );
        break;

      default:
        return Nan::ThrowTypeError("Unknown output type: should be \"number\" or \"buffer\"");
    }

    info.GetReturnValue().Set(result);
  }


  #undef HEXSTR_SIZE
  #undef HEXSTR_SIZEOF

  NAN_MODULE_INIT(Init)
  {
    Nan::SetMethod(target, "murmurHash",       MurmurHash<MurmurHash3_x86_32 , uint32_t, 1>);
    Nan::SetMethod(target, "murmurHash32",     MurmurHash<MurmurHash3_x86_32 , uint32_t, 1>);
    Nan::SetMethod(target, "murmurHash64x64",  MurmurHash<MurmurHash2_x64_64 , uint64_t, 1>);
    Nan::SetMethod(target, "murmurHash64x86",  MurmurHash<MurmurHash2_x86_64 , uint64_t, 1>);
    Nan::SetMethod(target, "murmurHash64",     MurmurHash<MurmurHash2_64     , uint64_t, 1>);
    Nan::SetMethod(target, "murmurHash128x64", MurmurHash<MurmurHash3_x64_128, uint64_t, 2>);
    Nan::SetMethod(target, "murmurHash128x86", MurmurHash<MurmurHash3_x86_128, uint32_t, 4>);
    Nan::SetMethod(target, "murmurHash128",    MurmurHash<MurmurHash3_128    , MurmurHash3_128ValueType
                                                                                       , MurmurHash3_128Length>);
  }

}

NODE_MODULE(murmurhash, MurmurHash::Init)
