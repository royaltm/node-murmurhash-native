#include "hasher.h"
#include "inputdata.h"
#include "hasher_impl.h"
#include "murmurhashutils.h"

namespace MurmurHash {
  using v8::Local;
  using v8::Value;
  using v8::Object;
  using v8::Int32;
  using v8::Uint32;
  using v8::String;
  using v8::Function;
  using v8::ObjectTemplate;

  #define SINGLE_ARG(...) __VA_ARGS__

  template<class H, typename HashValueType, ssize_t HashLength>
  Persistent<FunctionTemplate> IncrementalHasher<H,HashValueType,HashLength>::constructor;

  template<class H, typename HashValueType, ssize_t HashLength>
  IncrementalHasher<H,HashValueType,HashLength>
  ::IncrementalHasher(uint32_t seed) : hasher(seed), total(0) {};

  template<class H, typename HashValueType, ssize_t HashLength>
  NAN_INLINE void IncrementalHasher<H,HashValueType,HashLength>
  ::Update(void *data, int32_t length)
  {
    total += length;
    hasher.Update( data, length );
  }

  template<class H, typename HashValueType, ssize_t HashLength>
  NAN_INLINE void IncrementalHasher<H,HashValueType,HashLength>
  ::Digest(HashValueType *hash)
  {
    hasher.Digest( hash, total );
  }

  template<class H, typename HashValueType, ssize_t HashLength>
  NAN_METHOD(SINGLE_ARG(IncrementalHasher<H,HashValueType,HashLength>::New))
  {

    uint32_t seed = 0;
    IncrementalHasher<H,HashValueType,HashLength> *hasher;

    if ( info.IsConstructCall() ) {
      if ( info.Length() > 0 && info[0]->IsNumber() ) {
        seed = Nan::To<uint32_t>(info[0]).FromMaybe(0U);
      }

      hasher = new IncrementalHasher<H,HashValueType,HashLength>(seed);
      hasher->Wrap( info.This() );
      info.GetReturnValue().Set( info.This() );

    } else {
      int argc = std::min(1, info.Length());
      Local<Value> argv[1];
      if (argc > 0) argv[0] = info[0];
      Local<Function> cons = Nan::GetFunction(Nan::New(constructor)).ToLocalChecked();
      info.GetReturnValue().Set( Nan::NewInstance(cons, argc, &argv[0]).ToLocalChecked() );
    }
  }

  template<class H, typename HashValueType, ssize_t HashLength>
  NAN_METHOD(SINGLE_ARG(IncrementalHasher<H,HashValueType,HashLength>::Copy))
  {
    IncrementalHasher_T *hasher = ObjectWrap::Unwrap<IncrementalHasher_T>( info.This() );

    if ( info.Length() > 0 && Nan::New(IncrementalHasher_T::constructor)->HasInstance(info[0]) ) {
      IncrementalHasher_T *other = ObjectWrap::Unwrap<IncrementalHasher_T>( info[0].As<Object>() );
      other->hasher = hasher->hasher;
      other->total = hasher->total;
    } else {
      return Nan::ThrowTypeError("Need another instance of murmur hasher");
    }

    info.GetReturnValue().Set( info[0] );
  }

  template<class H, typename HashValueType, ssize_t HashLength>
  NAN_METHOD(SINGLE_ARG(IncrementalHasher<H,HashValueType,HashLength>::Update))
  {
    IncrementalHasher_T *hasher = ObjectWrap::Unwrap<IncrementalHasher_T>( info.This() );

    InputData data;

    int argc = info.Length();

    if ( argc > 0 ) {
      enum Nan::Encoding encoding = Nan::BUFFER;

      if ( info[0]->IsString() ) {
        encoding = Nan::UTF8;

        if ( argc > 1 && info[1]->IsString() ) {
          InputData::ReadEncodingString( info[1].As<String>() );
          (void) InputData::DetermineEncoding( encoding );
        }

      }

      data.Setup( info[0], encoding );
    }

    if ( ! data.IsValid() )
      return Nan::ThrowTypeError(data.Error());

    hasher->Update((void *)*data, (int32_t) data.length());

    info.GetReturnValue().Set( info.This() );
  }

  template<class H, typename HashValueType, ssize_t HashLength>
  NAN_METHOD(SINGLE_ARG(IncrementalHasher<H,HashValueType,HashLength>::Digest))
  {
    IncrementalHasher_T *hasher = ObjectWrap::Unwrap<IncrementalHasher_T>( info.This() );

    OutputType outputType( DefaultOutputType );

    int argc = info.Length();

    if ( argc > 0 && info[0]->IsString() ) {
      InputData::ReadEncodingString( info[0].As<String>() );
      outputType = InputData::DetermineOutputType();
    }

    Local<Value> result;

    HashValueType hash[HashLength];

    hasher->Digest( hash );

    switch(outputType) {
      case HexStringOutputType:
        result = HashToHexString<HashLength>( hash );
        break;

      case BinaryStringOutputType:
        result = HashToEncodedString<HashLength>( hash, Nan::BINARY );
        break;

      case Base64StringOutputType:
        result = HashToEncodedString<HashLength>( hash, Nan::BASE64 );
        break;

      case NumberOutputType:
        if (HashSize == sizeof(uint32_t)) {
          result = Nan::New<Uint32>( (uint32_t) (*hash) );
        } else {
          result = HashToHexString<HashLength>( hash );
        }
        break;

      default:
        result = Nan::NewBuffer( HashSize ).ToLocalChecked();
        WriteHashBytes<HashLength>(hash, (uint8_t *) node::Buffer::Data(result));
        break;
    }

    info.GetReturnValue().Set(result);
  }

  template<class H, typename HashValueType, ssize_t HashLength>
  NAN_GETTER(SINGLE_ARG(IncrementalHasher<H,HashValueType,HashLength>::GetTotal))
  {
    IncrementalHasher_T *hasher = ObjectWrap::Unwrap<IncrementalHasher_T>( info.This() );
    info.GetReturnValue().Set( Nan::New<Int32>(hasher->total) );
  }

  #undef SINGLE_ARG

  #define INIT_HASHER(NAME,H,HashValueType,HashLength,ALTNAME) do { \
    Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>( \
        IncrementalHasher<H,HashValueType,HashLength>::New); \
    tpl->SetClassName( Nan::New<String>(NAME).ToLocalChecked() ); \
    \
    Local<ObjectTemplate> i_t = tpl->InstanceTemplate(); \
    i_t->SetInternalFieldCount(1); \
    \
    Nan::SetAccessor( i_t, Nan::New<String>("total").ToLocalChecked(), \
        IncrementalHasher<H,HashValueType,HashLength>::GetTotal ); \
    \
    Nan::SetPrototypeMethod(tpl, "update", \
      IncrementalHasher<H,HashValueType,HashLength>::Update); \
    Nan::SetPrototypeMethod(tpl, "digest", \
      IncrementalHasher<H,HashValueType,HashLength>::Digest); \
    Nan::SetPrototypeMethod(tpl, "copy", \
      IncrementalHasher<H,HashValueType,HashLength>::Copy); \
    \
    Local<Value> fn = Nan::GetFunction(tpl).ToLocalChecked(); \
    IncrementalHasher<H,HashValueType,HashLength>::constructor.Reset( tpl ); \
    if (sizeof(ALTNAME) > 1) { \
      Nan::Set(target, Nan::New<String>(NAME).ToLocalChecked(), fn); \
      Nan::Set(target, Nan::New<String>(ALTNAME).ToLocalChecked(), fn); \
    } else { \
      Nan::Set(target, Nan::New<String>(NAME).ToLocalChecked(), fn); \
    } \
  } while(0)

  NAN_MODULE_INIT(Init)
  {
    INIT_HASHER("MurmurHash",       IncrementalMurmurHash3A,     uint32_t, 1, "");
  #ifdef NODE_MURMURHASH_DEFAULT_32BIT
    INIT_HASHER("MurmurHash128x64", IncrementalMurmurHash128x64, uint64_t, 2, "");
    INIT_HASHER("MurmurHash128x86", IncrementalMurmurHash128x86, uint32_t, 4, "MurmurHash128");
  #else
    INIT_HASHER("MurmurHash128x64", IncrementalMurmurHash128x64, uint64_t, 2, "MurmurHash128");
    INIT_HASHER("MurmurHash128x86", IncrementalMurmurHash128x86, uint32_t, 4, "");
  #endif
  }

  #undef INIT_HASHER
}

NODE_MODULE(murmurhashincremental, MurmurHash::Init)
