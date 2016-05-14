#include <algorithm>
#include <stdio.h>
#include <stdlib.h>
#include "nodemurmurhash.h"
#include "inputdata.h"
#include "MurmurHash2.h"
#include "MurmurHash3.h"

typedef void (*MurmurHashFunctionType)(const void *, int, uint32_t, void *);

#define HashSize ((ssize_t) (sizeof(HashValueType) * HashLength))

namespace MurmurHash {
  typedef enum {
    NumberOutputType,
    BufferOutputType,
    ProvidedBufferOutputType,
    UnknownOutputType,
    DefaultOutputType = NumberOutputType
  } OutputType;

  template<ssize_t HashLength, typename HashValueType>
  Local<Value> HashToHexString(const HashValueType *);

  template<MurmurHashFunctionType HashFunction, typename HashValueType, ssize_t HashLength>
  void MurmurHashBuffer(InputData &, uint32_t, char *, ssize_t, ssize_t, ssize_t);
}

#include "asyncworker.h"

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

  #define HEXSTR_SIZE 2
  #define HEXSTR_SIZEOF(size) ((size) * HEXSTR_SIZE + 1)

  template<typename T>
  NAN_INLINE char *ToHexString(T value, char * const out)
  {
    static const char hex[]= "0123456789abcdef";
    char * const endp = out + (sizeof(value) * HEXSTR_SIZE);
    for(char * ptr = endp ; ; value >>= 4) {
      *(--ptr) = hex[value & 0xf];
      value >>= 4;
      *(--ptr) = hex[value & 0xf];
      if (ptr == out) break;
    }
    return endp;
  }

  template<ssize_t HashLength, typename HashValueType>
  Local<Value> HashToHexString(const HashValueType * hash)
  {
    Nan::EscapableHandleScope scope;

    char str[HEXSTR_SIZEOF(sizeof(HashValueType) * HashLength)];
    char *out = str;

    const HashValueType * const valt = hash + HashLength;
    const HashValueType * valp = hash;
    while(valp < valt) {
      out = ToHexString( *(valp++), out );
    }
    *out = '\0';

    return scope.Escape(Nan::New<String>(str).ToLocalChecked());
  }

  OutputType DetermineOutputType(const Local<String> type)
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

  #define IS_ALIGNED(POINTER, TYPE) \
    ((((uintptr_t)(const void *)(POINTER)) & (sizeof(TYPE) - 1)) == 0)

  template<MurmurHashFunctionType HashFunction, typename HashValueType, ssize_t HashLength>
  void MurmurHashBuffer(InputData &data, uint32_t seed,
                                   char *buffer, ssize_t bufLength,
                                   ssize_t bufOffset, ssize_t bufHashLength)
  {
    ssize_t hashOffset = 0;

    if ( bufHashLength < 0 ) { // from the end of hash
      hashOffset = bufHashLength + HashSize;
      bufHashLength = -bufHashLength;
    }

    if ( bufOffset < 0 ) { // from the end of buffer
      bufOffset += bufLength;
    }

    if ( bufHashLength == 0 || bufLength <= 0 ||
         bufOffset <= -bufHashLength || bufOffset >= bufLength )
      return; // don't bother

    char *dest = buffer + bufOffset;

    if ( bufHashLength == HashSize && bufOffset >= 0
                                   && bufOffset + HashSize <= bufLength
                                   && IS_ALIGNED(dest, HashValueType)) {
      /* calculate hash directly into the buffer */
      HashFunction( (const void *) *data, (int) data.length(), seed, (void *)dest);
    } else {
      /* calculate hash and copy into the buffer */
      HashValueType hash[HashLength];
      HashFunction( (const void *) *data, (int) data.length(), seed, (void *)hash );
      if ( bufOffset < 0 ) {
        memcpy( (void *) buffer,
                (void *)((char *)hash + hashOffset - bufOffset),
                std::min(bufOffset + bufHashLength, bufLength) );
      } else {
        memcpy( (void *) dest,
                (void *)((char *)hash + hashOffset),
                std::min(bufHashLength, bufLength - bufOffset) );
      }
    }

  }

  #undef IS_ALIGNED

  #define GET_ARG_OFFSET(INFO,INDEX,ARGC)                                  \
            ((INDEX) + 1 < (ARGC)                                          \
            ? (ssize_t) Nan::To<int32_t>((INFO)[(INDEX) + 1]).FromMaybe(0) \
            : 0)

  #define GET_ARG_LENGTH(INFO,INDEX,ARGC,MAX)                        \
            ((INDEX) + 2 < (ARGC)                                    \
            ? std::max(                                              \
                  -(MAX),                                            \
                  std::min(                                          \
                    (MAX),                                           \
                    (ssize_t) Nan::To<int32_t>((INFO)[(INDEX) + 2]). \
                      FromMaybe(static_cast<int32_t>(MAX)) ))        \
            : (MAX))

  /**
   * Calculate MurmurHash from data
   * 
   * murmurHash(data[, callback])
   * murmurHash(data, output[, offset[, length]][, callback])
   * murmurHash(data{String}, encoding[, callback])
   * murmurHash(data, output_type[, callback])
   * murmurHash(data, seed[, output[, offset[, length]]][, callback])
   * murmurHash(data, seed[, output_type][, callback])
   * murmurHash(data{String}, encoding, output[, offset[, length]][, callback])
   * murmurHash(data{String}, encoding, output_type[, callback])
   * murmurHash(data{String}, encoding, seed[, output[, offset[, length]]][, callback])
   * murmurHash(data{String}, encoding, seed[, output_type][, callback])
   * 
   * @param {string|Buffer} data - a byte-string to calculate hash from
   * @param {string} encoding - data string encoding, should be:
   *       'utf8', 'ucs2', 'ascii', 'hex', 'base64' or 'binary';
   *       'binary' by default
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
   *       'number' by default
   * @param {Function} callback - optional callback(err, result)
   *       if provided the hash will be calculated asynchronously using libuv
   *       worker queue, the return value in this instance will be `undefined`
   *       and the result will be provided to the callback function;
   *       Be carefull as reading and writing by multiple threads to the same
   *       memory may render undetermined results
   * 
   * The order of bytes written to a Buffer is platform dependent.
   * 
   * `data` and `output` arguments might reference the same Buffer object
   * or buffers referencing the same memory (views).
   * 
   * @return {number|Buffer|String|undefined}
  **/
  template<MurmurHashFunctionType HashFunction, typename HashValueType, ssize_t HashLength>
  NAN_METHOD(MurmurHash)
  {
    InputData data;

    OutputType outputType( DefaultOutputType );

    uint32_t seed = 0;

    /* parse args */
    int argc = std::min( 7, info.Length() );
    int outputTypeIndex = argc;
    int callbackIndex = -1;
    bool setupWithEncoding = false;

    if ( argc > 0 && info[argc - 1]->IsFunction() ) {
      callbackIndex = --argc;
    }

    if ( argc >= 2 ) {

      if ( info[1]->IsString() ) { // input_encoding or output_type
        if ( argc == 2 ) { // try output_type
          outputType = DetermineOutputType( info[1].As<String>() );
          if (outputType == UnknownOutputType) { // input_encoding
            setupWithEncoding = true;
            outputType = DefaultOutputType; // revert to default
          } // else output_type
        } else { // try input_encoding
          setupWithEncoding = true;
          outputTypeIndex = 2; // continue from 2
        }
      } else {
        // output or seed
        if ( node::Buffer::HasInstance(info[1]) ) {
          outputType = ProvidedBufferOutputType;
          outputTypeIndex = 1;
        } else {
          if ( info[1]->IsNumber() )
            seed = Nan::To<uint32_t>(info[1]).FromMaybe(0U);
          outputTypeIndex = 2; // continue from 2
        }
      }
      if ( outputType == DefaultOutputType ) { // output_type or output or seed
        for (; outputTypeIndex < argc; ++outputTypeIndex ) {
          if ( info[outputTypeIndex]->IsNumber() ) {
            seed = Nan::To<uint32_t>(info[outputTypeIndex]).FromMaybe(0U);
          } else if ( info[outputTypeIndex]->IsString() ) {
            outputType = DetermineOutputType( info[outputTypeIndex].As<String>() );
            break;
          } else if ( node::Buffer::HasInstance(info[outputTypeIndex]) ) {
            outputType = ProvidedBufferOutputType;
            break;
          } else
            break;
        }
      }

    }

    if ( callbackIndex > -1 ) {
      MurmurHashWorker<HashFunction,HashValueType,HashLength> *asyncWorker;
      Nan::Callback *callback = new Nan::Callback(
                                  Local<Function>::Cast(info[callbackIndex]));

      if ( argc > 0 ) {
        if (setupWithEncoding) {
          asyncWorker = new MurmurHashWorker<HashFunction,HashValueType,HashLength>(
            callback, outputType, seed, info[0], info[1].As<String>());
        } else {
          asyncWorker = new MurmurHashWorker<HashFunction,HashValueType,HashLength>(
            callback, outputType, seed, info[0]);
        }
      } else {
        asyncWorker = new MurmurHashWorker<HashFunction,HashValueType,HashLength>(callback);
      }

      if (outputType == ProvidedBufferOutputType) {
        asyncWorker->SaveOutputBuffer(
            info[outputTypeIndex],
            GET_ARG_OFFSET(info, outputTypeIndex, argc),
            GET_ARG_LENGTH(info, outputTypeIndex, argc, HashSize));
      }

      Nan::AsyncQueueWorker(asyncWorker);

      info.GetReturnValue().Set(Nan::Undefined());

    } else {

      if ( argc > 0 ) {
        if (setupWithEncoding) {
          data.Setup( info[0], info[1].As<String>() );
        } else {
          data.Setup( info[0] );
        }
      }

      if ( ! data.IsValid() )
        return Nan::ThrowTypeError(data.Error());

      Local<Value> result;

      switch(outputType) {
        case ProvidedBufferOutputType:
          result = info[outputTypeIndex];
          {
            Local<Object> buffer = result.As<Object>();
            MurmurHashBuffer<HashFunction, HashValueType, HashLength>(
                  data, seed,
                  node::Buffer::Data(buffer),
                  (ssize_t) node::Buffer::Length(buffer),
                  GET_ARG_OFFSET(info, outputTypeIndex, argc),
                  GET_ARG_LENGTH(info, outputTypeIndex, argc, HashSize));
          }
          break;

        case NumberOutputType:
          {
            HashValueType hash[HashLength];
            HashFunction( (const void *) *data, (int) data.length(), seed, (void *)hash );

            if (HashSize == sizeof(uint32_t)) {
              result = Nan::New<Uint32>( (uint32_t) (*hash) );
            } else {
              result = HashToHexString<HashLength>( hash );
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
  }

  #undef GET_ARG_OFFSET
  #undef GET_ARG_LENGTH

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
