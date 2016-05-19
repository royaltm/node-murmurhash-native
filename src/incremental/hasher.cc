#include "hasher.h"
#include "inputdata.h"
#include "murmurhashutils.h"
#include "hasher_impl.h"

namespace MurmurHash {
  using v8::Object;
  using v8::Int32;
  using v8::Uint32;
  using v8::String;
  using v8::Function;
  using v8::ObjectTemplate;
  using v8::PropertyAttribute;
  using v8::ReadOnly;
  using v8::DontDelete;
  using v8::MaybeLocal;

  #define SINGLE_ARG(...) __VA_ARGS__

  /**
   * @class
   *
   * Create MurmurHash utility
   * 
   * new MurmurHash([seed|hash|serial])
   *
   * @param {number} seed - initial murmur hash seed as 32 bit integer
   * @param {MurmurHash} hash - an instance of another MurmurHash of the same type
   * @param {string|Buffer} serial - serialized state of the same MurmurHash type
  **/
  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_METHOD(SINGLE_ARG(IncrementalHasher<H,HashValueType,HashLength>::New))
  {

    IncrementalHasher_T *self;

    if ( info.IsConstructCall() ) {

      if ( info.Length() > 0 ) {
        if ( info[0]->IsNumber() ) {
          // seed
          uint32_t seed = Nan::To<uint32_t>(info[0]).FromMaybe(0U);
          self = new IncrementalHasher_T(seed);

        } else if ( Nan::New(IncrementalHasher_T::constructor)->HasInstance( info[0] ) ) {
          // hasher instance
          IncrementalHasher_T *other = ObjectWrap::Unwrap<IncrementalHasher_T>( info[0].As<Object>() );
          self = new IncrementalHasher_T(*other);

        } else if ( info[0]->IsString() ) {
          // serial string
          uint8_t serial[HashSerialSize];
          if ( HashSerialStringSize == info[0].As<String>()->Length() ) {
            Nan::DecodeWrite( (char *) serial, sizeof(serial), info[0], Nan::BASE64 );
          } else {
            return Nan::ThrowTypeError("Incorrect size of the serialized string");
          }
          if ( IncrementalHasher_T::IsSerialTypeValid( serial ) ) {
            self = new IncrementalHasher_T(serial);
          } else {
            return Nan::ThrowTypeError("Incorrect serialized string");
          }

        } else if ( node::Buffer::HasInstance( info[0] ) ) {
          // serial buffer
          if ( HashSerialSize <= static_cast<int32_t>(node::Buffer::Length( info[0] )) ) {
            uint8_t *serial = (uint8_t *) node::Buffer::Data( info[0] );
            if ( IncrementalHasher_T::IsSerialTypeValid( serial ) ) {
              self = new IncrementalHasher_T(serial);
            } else {
              return Nan::ThrowTypeError("Incorrect serialized data");
            }
          } else {
            return Nan::ThrowTypeError("Incorrect size of the serialized data");
          }

        } else if ( info[0]->IsUndefined() || info[0]->IsNull() ) {
          self = new IncrementalHasher_T();
        } else {
          return Nan::ThrowTypeError("Expected a seed number, MurmurHash instance or serialized state");
        }

      } else {
        self = new IncrementalHasher_T();
      }

      self->Wrap( info.This() );
      info.GetReturnValue().Set( info.This() );

    } else {
      int argc = std::min(1, info.Length());
      Local<Value> argv[1];
      if (argc > 0) argv[0] = info[0];
      Local<Function> cons = Nan::GetFunction(Nan::New(constructor)).ToLocalChecked();
      MaybeLocal<Object> mayinst = Nan::NewInstance(cons, argc, &argv[0]);
      if ( ! mayinst.IsEmpty() ) {
        info.GetReturnValue().Set( mayinst.ToLocalChecked() );
      }
    }
  }

  /**
   * Serialize the internal state of the murmur hash utility instance
   * 
   * serialize([output[, offset]])
   * 
   * If the output buffer is not provided the serial is generated as a base64
   * encoded string. When output has not enough space for the serialized data
   * at the given offset it throws an Error. You may consult the required
   * byte length reading constant: MurmurHashClass.SERIAL_BYTE_LENGTH
   * 
   * @param {Buffer} output - a buffer to write serialized state to
   * @param {number} offset - offset at output
   * @return {string|Buffer}
  **/
  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_METHOD(SINGLE_ARG(IncrementalHasher<H,HashValueType,HashLength>::Serialize))
  {
    IncrementalHasher_T *self = ObjectWrap::Unwrap<IncrementalHasher_T>( info.Holder() );

    int argc = info.Length();

    Local<Value> result;

    if ( argc > 0 && node::Buffer::HasInstance( info[0] ) ) {

      int32_t length = static_cast<int32_t>(node::Buffer::Length( info[0] ));
      int32_t offset = (argc > 1) ? Nan::To<int32_t>(info[1]).FromMaybe(0) : 0;

      if (offset < 0) offset += length;

      if (offset >= 0 && HashSerialSize <= length - offset ) {

        result = info[0];
        uint8_t *serial = (uint8_t *) node::Buffer::Data( result ) + offset;
        self->Serialize(serial);

      } else {
        return Nan::ThrowError("Serialized state does not fit in the provided buffer at the given offset");
      }
    } else {

      uint8_t serial[HashSerialSize];
      self->Serialize(serial);
      result = Nan::Encode((void *)serial, sizeof(serial), Nan::BASE64);

    }

    info.GetReturnValue().Set( result );
  }

  /**
   * Copy the internal state onto the target utility instance
   * 
   * copy(target)
   * 
   * @param {MurmurHash} target - a different instance of MurmurHash utility
   *                              of the same type
   * @return {MurmurHash} target
  **/
  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_METHOD(SINGLE_ARG(IncrementalHasher<H,HashValueType,HashLength>::Copy))
  {
    IncrementalHasher_T *self = ObjectWrap::Unwrap<IncrementalHasher_T>( info.Holder() );

    if ( info.Length() > 0 && Nan::New(IncrementalHasher_T::constructor)->HasInstance( info[0] ) ) {
      IncrementalHasher_T *other = ObjectWrap::Unwrap<IncrementalHasher_T>( info[0].As<Object>() );
      if ( other == self ) {
        return Nan::ThrowError("Target must not be the same instance");
      }
      *other = *self;
    } else {
      return Nan::ThrowTypeError("Target must be another instance of the same murmur hash type utility");
    }

    info.GetReturnValue().Set( info[0] );
  }

  /**
   * Update internal state with the given data
   *
   * update(data[, encoding])
   *
   * The encoding can be 'utf8', 'ascii', 'binary', 'ucs2', 'base64' or 'hex'.
   * If encoding is not provided or is not known and the data is a string,
   * an encoding of 'utf8' is enforced. If data is a Buffer then encoding is ignored.
   * 
   * @param {string|Buffer} data
   * @param {string} [encoding]
   * @return {MurmurHash} this
  **/
  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_METHOD(SINGLE_ARG(IncrementalHasher<H,HashValueType,HashLength>::Update))
  {
    IncrementalHasher_T *self = ObjectWrap::Unwrap<IncrementalHasher_T>( info.Holder() );

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

    self->Update((void *)*data, (int32_t) data.length());

    info.GetReturnValue().Set( self->handle() );
  }

  /**
   * Generate the murmur hash of all of the data provided so far
   * 
   * digest([output_type])
   * digest(output, offset, length)
   * 
   * output_type indicates the form and encoding of the returned hash and can be one of:
   *
   * - 'number' - for 32-bit murmur hash an unsigned 32-bit integer,
   *              other hashes - hexadecimal string
   * - 'hex'    - hexadecimal string
   * - 'base64' - base64 string
   * - 'binary' - binary string
   * - 'buffer' - a new Buffer object
   *
   * If neither output nor known output_type is provided a Buffer is returned.
   * 
   * @param {string} [output_type]
   * @param {Buffer} output - a Buffer object to write hash bytes to;
   *       the same object will be returned
   * @param {number} offset - start writing into output at offset byte;
   *       negative offset starts from the end of the output buffer
   * @param {number} length - a number of bytes to write from calculated hash;
   *       negative length starts from the end of the hash;
   *       if absolute value of length is larger than the size of a calculated
   *       hash, bytes are written only up to the hash size
   * @return {Buffer|string|number} murmur hash
  **/
  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_METHOD(SINGLE_ARG(IncrementalHasher<H,HashValueType,HashLength>::Digest))
  {
    IncrementalHasher_T *hasher = ObjectWrap::Unwrap<IncrementalHasher_T>( info.Holder() );

    OutputType outputType( DefaultOutputType );

    int argc = info.Length();

    if ( argc > 0 ) {
      if ( info[0]->IsString() ) {
        InputData::ReadEncodingString( info[0].As<String>() );
        outputType = InputData::DetermineOutputType();
      } else if ( node::Buffer::HasInstance( info[0] ) ) {
        outputType = ProvidedBufferOutputType;
      }
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

      case ProvidedBufferOutputType:
        result = info[0];
        WriteHashToBuffer<HashLength>(
              hash,
              node::Buffer::Data(result),
              (int32_t) node::Buffer::Length(result),
              (argc > 1) ? Nan::To<int32_t>(info[1]).FromMaybe(0) : 0,
              (argc > 2)
              ? Nan::To<int32_t>(info[2]).FromMaybe(HashSize)
              : HashSize);
        break;

      default:
        result = Nan::NewBuffer( HashSize ).ToLocalChecked();
        WriteHashBytes<HashLength>(hash, (uint8_t *) node::Buffer::Data(result));
        break;
    }

    info.GetReturnValue().Set( result );
  }

  /**
   * @property {number} total - (read only) The total (modulo 2^32) bytes of data
   *                                                              provided so far
  **/
  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_GETTER(SINGLE_ARG(IncrementalHasher<H,HashValueType,HashLength>::GetTotal))
  {
    IncrementalHasher_T *self = ObjectWrap::Unwrap<IncrementalHasher_T>( info.Holder() );
    info.GetReturnValue().Set( Nan::New<Uint32>(self->total) );
  }

  #undef SINGLE_ARG

  /*************************************************/
  /******************** private ********************/
  /*************************************************/

  /*---------------- constructors -----------------*/

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_INLINE IncrementalHasher<H,HashValueType,HashLength>
  ::IncrementalHasher(const uint32_t seed) : hasher(seed), total(0) {};

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_INLINE IncrementalHasher<H,HashValueType,HashLength>
  ::IncrementalHasher(const IncrementalHasher_T& other) : ObjectWrap(),
                                                          hasher(other.hasher),
                                                          total(other.total) {};

  #define HashSerialTotalIndex (HashSerialCarryIndex + HashSize)
  #define HashSerialType (static_cast<uint8_t>(0x0F ^ HashLength ^ sizeof(HashValueType)) << 4)
  #define HashSerialTypeMask static_cast<uint8_t>(0xF0 | (0x10 - HashSize))
  #define HashSerialTypeIndex (HashSerialTotalIndex - 1)
  /*
                           HashSerialType           HashSerialTypeMask
          MurmurHash3A     0b101000nn 15 ^ 1 ^ 4 = 0xA0  0xF0 | 0x10 - 4  = 0xFC
          MurmurHash128x64 0b0101nnnn 15 ^ 2 ^ 8 = 0x50  0xF0 | 0x10 - 16 = 0xF0
          MurmurHash128x86 0b1111nnnn 15 ^ 4 ^ 4 = 0xF0  0xF0 | 0x10 - 16 = 0xF0
          MurmurHash64x64  0b01100nnn 15 ^ 1 ^ 8 = 0x60  0xF0 | 0x10 - 8  = 0xF8
          MurmurHash64x86  0b10010nnn 15 ^ 2 ^ 4 = 0x90  0xF0 | 0x10 - 8  = 0xF8
  */

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_INLINE IncrementalHasher<H,HashValueType,HashLength>
  ::IncrementalHasher(const uint8_t *serial) : hasher(serial)
  {
    ReadHashBytes<1>(&serial[HashSerialTotalIndex], &total);
  }

  /*-------------- instance methods ---------------*/

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_INLINE bool IncrementalHasher<H,HashValueType,HashLength>
  :: IsSerialTypeValid(uint8_t *serial)
  {
    return HashSerialType == (serial[HashSerialTypeIndex] & HashSerialTypeMask);
  }

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_INLINE void IncrementalHasher<H,HashValueType,HashLength>
  ::Serialize(uint8_t *serial)
  {
    hasher.Serialize(serial);
    serial[HashSerialTypeIndex] |= HashSerialType;
    WriteHashBytes<1>(&total, &serial[HashSerialTotalIndex]);
  }

  #undef HashSerialTotalIndex
  #undef HashSerialType
  #undef HashSerialTypeMask
  #undef HashSerialTypeIndex
  #undef HashSerialTypeValid

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_INLINE void IncrementalHasher<H,HashValueType,HashLength>
  ::Update(void *data, uint32_t length)
  {
    total += length;
    hasher.Update( data, length );
  }

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_INLINE void IncrementalHasher<H,HashValueType,HashLength>
  ::Digest(HashValueType *hash)
  {
    hasher.Digest( hash, total );
  }

  /*------------------ operators ------------------*/

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_INLINE void IncrementalHasher<H,HashValueType,HashLength>
  ::operator=(const IncrementalHasher_T& other)
  {
    hasher = other.hasher;
    total  = other.total;
  }

  /*-------------- static variables ---------------*/

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  Persistent<FunctionTemplate> IncrementalHasher<H,HashValueType,HashLength>::constructor;

  /*------------------ node init ------------------*/

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  void IncrementalHasher<H,HashValueType,HashLength>
  ::Init(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE& target, const char* name, const char *altname)
  {
    Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>(IncrementalHasher_T::New);
    tpl->SetClassName( Nan::New<String>(name).ToLocalChecked() );
   
    Local<ObjectTemplate> i_t = tpl->InstanceTemplate();
    i_t->SetInternalFieldCount(1);
   
    Nan::SetAccessor( i_t, Nan::New<String>("total").ToLocalChecked(),
                           IncrementalHasher_T::GetTotal );
   
    Nan::SetTemplate(tpl, Nan::New<String>("SERIAL_BYTE_LENGTH").ToLocalChecked(),
                          Nan::New<Int32>(HashSerialSize),
                          static_cast<PropertyAttribute>(ReadOnly | DontDelete) );
    Nan::SetInstanceTemplate(tpl,
                          Nan::New<String>("SERIAL_BYTE_LENGTH").ToLocalChecked(),
                          Nan::New<Int32>(HashSerialSize),
                          static_cast<PropertyAttribute>(ReadOnly | DontDelete) );
    Nan::SetPrototypeMethod(tpl, "copy",      IncrementalHasher_T::Copy);
    Nan::SetPrototypeMethod(tpl, "serialize", IncrementalHasher_T::Serialize);
    Nan::SetPrototypeMethod(tpl, "toJSON",    IncrementalHasher_T::Serialize);
    Nan::SetPrototypeMethod(tpl, "update",    IncrementalHasher_T::Update);
    Nan::SetPrototypeMethod(tpl, "digest",    IncrementalHasher_T::Digest);
   
    Local<Value> fn = Nan::GetFunction(tpl).ToLocalChecked();
    IncrementalHasher_T::constructor.Reset( tpl );
    if (altname != NULL) {
      Nan::Set(target, Nan::New<String>(name).ToLocalChecked(), fn);
      Nan::Set(target, Nan::New<String>(altname).ToLocalChecked(), fn);
    } else {
      Nan::Set(target, Nan::New<String>(name).ToLocalChecked(), fn);
    }
  }

  NAN_MODULE_INIT(Init)
  {
    IncrementalHasher<IncrementalMurmurHash3A,  uint32_t, 1>::Init(target, "MurmurHash");
  #ifdef NODE_MURMURHASH_DEFAULT_32BIT
    IncrementalHasher<IncrementalMurmurHash128, uint64_t, 2>::Init(target, "MurmurHash128x64");
    IncrementalHasher<IncrementalMurmurHash128, uint32_t, 4>::Init(target, "MurmurHash128x86", "MurmurHash128");
  #else
    IncrementalHasher<IncrementalMurmurHash128, uint64_t, 2>::Init(target, "MurmurHash128x64", "MurmurHash128");
    IncrementalHasher<IncrementalMurmurHash128, uint32_t, 4>::Init(target, "MurmurHash128x86");
  #endif
  }
}

NODE_MODULE(murmurhashincremental, MurmurHash::Init)
