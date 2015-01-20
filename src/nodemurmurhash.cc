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
  using node::Buffer;

  static Persistent<Function> int8ArrayFunction;
  static Persistent<Function> int16ArrayFunction;
  static Persistent<Function> int32ArrayFunction;
  static Persistent<Function> uint8ArrayFunction;
  static Persistent<Function> uint16ArrayFunction;
  static Persistent<Function> uint32ArrayFunction;

  typedef enum {
    IllegalOutputType,
    NumberOutputType,
    BufferOutputType,
    BinaryOutputType,
    Ucs2OutputType,
    AsciiOutputType,
    Utf8OutputType,
    HexOutputType,
    Base64OutputType,
    Int8OutputType,
    Int16OutputType,
    Int32OutputType,
    Uint8OutputType,
    Uint16OutputType,
    Uint32OutputType
  } OutputType;

  NAN_INLINE static Local<Object> CreateResultArrayFrom(
      const Handle<Function> &constr,
      size_t length,
      size_t elementsize)
  {
    NanEscapableScope();
    Local<Value> bufargv[] = {
      NanNew<Uint32>( (uint32_t) (length / elementsize) )
    };
    const Local<Object> array(constr->NewInstance(1, bufargv));
    return NanEscapeScope(array);
  }

  NAN_INLINE static void *CreateResult(
      const OutputType outputType,
      size_t length,
      Local<Value> &result)
  {
    static char buffer[NODE_MURMURHASH_HASH_BUFFER_SIZE];
    switch(outputType) {
      case Int8OutputType:
        result = CreateResultArrayFrom( int8ArrayFunction, length, 1 );
        return result.As<Object>()->GetIndexedPropertiesExternalArrayData();
      case Int16OutputType:
        result = CreateResultArrayFrom( int16ArrayFunction, length, 2 );
        return result.As<Object>()->GetIndexedPropertiesExternalArrayData();
      case Int32OutputType:
        result = CreateResultArrayFrom( int32ArrayFunction, length, 4 );
        return result.As<Object>()->GetIndexedPropertiesExternalArrayData();
      case Uint8OutputType:
        result = CreateResultArrayFrom( uint8ArrayFunction, length, 1 );
        return result.As<Object>()->GetIndexedPropertiesExternalArrayData();
      case Uint16OutputType:
        result = CreateResultArrayFrom( uint16ArrayFunction, length, 2 );
        return result.As<Object>()->GetIndexedPropertiesExternalArrayData();
      case Uint32OutputType:
        result = CreateResultArrayFrom( uint32ArrayFunction, length, 4 );
        return result.As<Object>()->GetIndexedPropertiesExternalArrayData();
      case NumberOutputType:
        if ( length == sizeof(uint32_t) )
          break;
      case BufferOutputType:
        result = NanNewBufferHandle( (uint32_t) length );
        return Buffer::Data(result);
    }
    return buffer;
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

  static OutputType DetermineOutputType(const Handle<Value> &type)
  {
    NanScope();

    char typeCstr[sizeof("utf-16le")];
    Local<String> typeString = type->ToString();
    int length = typeString->Length();

    if ( length > 0 && length <= sizeof(typeCstr) - 1 ) {

      typeString->WriteAscii(typeCstr);
      
      if ( length >= 4 ) {
        if ( strcasecmp(typeCstr, "number") == 0 )
          return NumberOutputType;
        if ( strcasecmp(typeCstr, "base64") == 0 )
          return Base64OutputType;
        if ( strcasecmp(typeCstr, "binary") == 0 )
          return BinaryOutputType;
        if ( strncasecmp(typeCstr, "int", 3) == 0 ) {
          if ( strcmp(typeCstr + 3, "8") == 0 ||
               strcmp(typeCstr + 3, "-8") == 0 )
            return Int8OutputType;
          if ( strcmp(typeCstr + 3, "16") == 0 ||
               strcmp(typeCstr + 3, "-16") == 0 )
            return Int16OutputType;
          if ( strcmp(typeCstr + 3, "32") == 0 ||
               strcmp(typeCstr + 3, "-32") == 0 )
            return Int32OutputType;
        } else if ( strcasecmp(typeCstr, "utf8") == 0 ) {
          return Utf8OutputType;
        } else if ( strcasecmp(typeCstr, "ucs2") == 0 ) {
          return Ucs2OutputType;
        } else if ( strncasecmp(typeCstr, "uint", 4) == 0 ) {
          if ( strcmp(typeCstr + 4, "8") == 0 ||
               strcmp(typeCstr + 4, "-8") == 0 )
            return Uint8OutputType;
          if ( strcmp(typeCstr + 4, "16") == 0 ||
               strcmp(typeCstr + 4, "-16") == 0 )
            return Uint16OutputType;
          if ( strcmp(typeCstr + 4, "32") == 0 ||
               strcmp(typeCstr + 4, "-32") == 0 )
            return Uint32OutputType;
        } else if ( strcasecmp(typeCstr, "ascii") == 0 ) {
          return AsciiOutputType;
        } else if ( strcasecmp(typeCstr, "utf-8") == 0 ) {
          return Utf8OutputType;
        } else if ( strcasecmp(typeCstr, "ucs-2") == 0 ) {
          return Ucs2OutputType;
        } else if ( length > 6 && (
            strcasecmp(typeCstr, "utf16le") == 0 ||
            strcasecmp(typeCstr, "utf-16le") == 0
          ) )
          return Ucs2OutputType;
      } else if ( strcasecmp(typeCstr, "hex") == 0 )
        return HexOutputType;
    }
    return BufferOutputType;
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
   *       default is 'utf8'
   * @param {Uint32} seed - murmur hash seed, default is 0
   * @param {string} output_type - how to encode output, can be:
   *       'number' (murmurHash32 only) - a 32-bit integer,
   *       'buffer' - Buffer output,
   *       'utf8', 'ucs2', 'ascii', 'hex', 'base64' or 'binary' - string output,
   *       'int32', 'int16', 'int8', 'uint32', 'uint16', 'uint8' - typed-array,
   *       default is 'number' or 'buffer'
   *
   * @return {number|Buffer|String|Int8Array|Int16Array|Int32Array|Uint8Array|Uint16Array|Uint32Array}
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
        outputType = DetermineOutputType( args[3] );
        seed = args[2]->Uint32Value();
        data.Setup( args[0], args[1] );
        break;
      case 3:
        if ( args[2]->IsString() ) {
          outputType = DetermineOutputType( args[2] );
        } else {
          seed = args[2]->Uint32Value();
        }
        if ( args[1]->IsString() ) {
          data.Setup( args[0], args[1] );
        } else {
          seed = args[1]->Uint32Value();
          data.Setup( args[0] );
        }
        break;
      case 2:
        if ( args[1]->IsString() ) {
          if ( args[0]->IsString() ) {
            data.Setup( args[0], args[1] );
          } else {
            outputType = DetermineOutputType( args[1] );
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

    Local<Value> result;
    void *out = CreateResult(outputType, HashSize, result);

    HashFunction( (const void *) *data, (int) data.length(), seed, out );

    if ( result.IsEmpty() )
      result = GetResultFrom( outputType, (char *)out, HashSize );

    NanReturnValue(result);
  }

  void Init(Handle<Object> exports) {

    NanAssignPersistent(int8ArrayFunction,
      Local<Function>::Cast(NanGetCurrentContext()->Global()->Get(
        NanNew<String>("Int8Array"))));
    NanAssignPersistent(int16ArrayFunction,
      Local<Function>::Cast(NanGetCurrentContext()->Global()->Get(
        NanNew<String>("Int16Array"))));
    NanAssignPersistent(int32ArrayFunction,
      Local<Function>::Cast(NanGetCurrentContext()->Global()->Get(
        NanNew<String>("Int32Array"))));
    NanAssignPersistent(uint8ArrayFunction,
      Local<Function>::Cast(NanGetCurrentContext()->Global()->Get(
        NanNew<String>("Uint8Array"))));
    NanAssignPersistent(uint16ArrayFunction,
      Local<Function>::Cast(NanGetCurrentContext()->Global()->Get(
        NanNew<String>("Uint16Array"))));
    NanAssignPersistent(uint32ArrayFunction,
      Local<Function>::Cast(NanGetCurrentContext()->Global()->Get(
        NanNew<String>("Uint32Array"))));

    exports->Set( NanNew<String>("murmurHash"),
              NanNew<FunctionTemplate>(MurmurHash<MurmurHash3_x86_32, 4>)->GetFunction() );
    exports->Set( NanNew<String>("murmurHash32"),
              NanNew<FunctionTemplate>(MurmurHash<MurmurHash3_x86_32, 4>)->GetFunction() );
    exports->Set( NanNew<String>("murmurHash128"),
              NanNew<FunctionTemplate>(MurmurHash<MurmurHash3_128, 16>)->GetFunction() );
    exports->Set( NanNew<String>("murmurHash128x64"),
              NanNew<FunctionTemplate>(MurmurHash<MurmurHash3_x64_128, 16>)->GetFunction() );
    exports->Set( NanNew<String>("murmurHash128x86"),
              NanNew<FunctionTemplate>(MurmurHash<MurmurHash3_x86_128, 16>)->GetFunction() );
    exports->Set( NanNew<String>("murmurHash64"),
              NanNew<FunctionTemplate>(MurmurHash<MurmurHash2_64, 8>)->GetFunction() );
    exports->Set( NanNew<String>("murmurHash64x64"),
              NanNew<FunctionTemplate>(MurmurHash<MurmurHash2_x64_64, 8>)->GetFunction() );
    exports->Set( NanNew<String>("murmurHash64x86"),
              NanNew<FunctionTemplate>(MurmurHash<MurmurHash2_x86_64, 8>)->GetFunction() );

  }
}

NODE_MODULE(murmurhash, MurmurHash::Init)