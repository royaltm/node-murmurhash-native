#if !defined(INCREMENTAL_HASHER_HEADER)
#define INCREMENTAL_HASHER_HEADER

#include "nodemurmurhash.h"

namespace MurmurHash {
  using v8::Local;
  using v8::Value;
  using v8::FunctionTemplate;
  using Nan::Persistent;
  using Nan::ObjectWrap;

  NAN_MODULE_INIT(Init);

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  class IncrementalHasher : public ObjectWrap {
    public:
      typedef IncrementalHasher<H,HashValueType,HashLength> IncrementalHasher_T;
      typedef uint32_t total_t;
      typedef uint32_t checksum_t;

      static void Init(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE& target,
                                    const char* name, const char *altname = NULL);

      static NAN_METHOD(New);
      static NAN_METHOD(Copy);
      static NAN_METHOD(Digest);
      static NAN_METHOD(Serialize);
      static NAN_METHOD(Update);

      static NAN_GETTER(GetEndianness);
      static NAN_SETTER(SetEndianness);
      static NAN_GETTER(GetIsBusy);
      static NAN_GETTER(GetTotal);

      NAN_INLINE static bool IsSerialTypeValid(uint8_t *serial);

      static Persistent<FunctionTemplate> constructor;

      NAN_INLINE void AsyncUpdateComplete(void);
      NAN_INLINE bool CheckAsyncUpdateInProgress(void) const;
      NAN_INLINE void Digest(HashValueType *hash) const;
      NAN_INLINE void Serialize(uint8_t *serial) const;
      NAN_INLINE void Update(const void *data, uint32_t length);

      char dataBuffer[NODE_MURMURHASH_KEY_BUFFER_SIZE];

    private:
      NAN_INLINE IncrementalHasher(const uint32_t seed = 0U);
      NAN_INLINE IncrementalHasher(const uint8_t * const serial);
      NAN_INLINE IncrementalHasher(const IncrementalHasher_T& other);
      NAN_INLINE void operator=(const IncrementalHasher_T&);

      template<ByteOrderType OutputByteOrder>
      NAN_INLINE static void Output(const HashValueType hash[HashLength], const OutputType &outputType,
                            const int &argc, Nan::NAN_METHOD_ARGS_TYPE info, Local<Value> &result);

      NAN_INLINE bool AsyncUpdateBegin(void);
      bool SetEndiannessFrom(const Local<Value> &value);

      H<HashValueType,HashLength> hasher;
      total_t total;
      ByteOrderType outputByteOrder;
      bool asyncInProgress;

      #define BASE64_ENCODED_SIZE(size) ((size + 2 - ((size + 2) % 3)) / 3 * 4)

      static const int32_t kHashSerialTotalIndex = HashSize + HashSize;
      static const int32_t kHashSerialCkSize = 3;
      static const checksum_t kHashSerialCkSeed = 0xDEADBACA;
      static const checksum_t kHashSerialCkMask = static_cast<checksum_t>((1LLU << (kHashSerialCkSize * 8)) - 1);
      static const int32_t kHashSerialCkIndex = kHashSerialTotalIndex + sizeof(total_t);
      static const int32_t kHashSerialSize = kHashSerialCkIndex + kHashSerialCkSize;
      static const int32_t kHashSerialStringSize = BASE64_ENCODED_SIZE(kHashSerialSize);
      /*
       Serial data in network byte order
                            0: hstate[MSByte] ... hstate[LSByte]
                    +HashSize:  carry[MSByte] ... carry[LSByte]
                    +HashSize:  total[MSByte] ... total[LSByte]
               +sizeof(total):  chksum = ((ck[0] ^ chksum >>24)<<16) | ck[1]<<8 | ck[2]
      */
      static const uint8_t kHashSerialType = static_cast<uint8_t>((0x0F ^ HashLength ^ sizeof(HashValueType)) << 4);
      static const uint8_t kHashSerialTypeMask = static_cast<uint8_t>(0xF0 | (0x10 - HashSize));
      static const int32_t kHashSerialTypeIndex = kHashSerialTotalIndex - 1;
      /*
                               kHashSerialType           kHashSerialTypeMask
              MurmurHash3A     0b101000nn 15 ^ 1 ^ 4 = 0xA0  0xF0 | 0x10 - 4  = 0xFC
              MurmurHash128x64 0b0101nnnn 15 ^ 2 ^ 8 = 0x50  0xF0 | 0x10 - 16 = 0xF0
              MurmurHash128x86 0b1111nnnn 15 ^ 4 ^ 4 = 0xF0  0xF0 | 0x10 - 16 = 0xF0
              MurmurHash64x64  0b01100nnn 15 ^ 1 ^ 8 = 0x60  0xF0 | 0x10 - 8  = 0xF8
              MurmurHash64x86  0b10010nnn 15 ^ 2 ^ 4 = 0x90  0xF0 | 0x10 - 8  = 0xF8
      */
      #undef BASE64_ENCODED_SIZE
  };

}

#endif