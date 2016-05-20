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

      static void Init(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE& target,
                                 const char* name, const char *altname = NULL);

      static NAN_METHOD(New);
      static NAN_METHOD(Serialize);
      static NAN_METHOD(Copy);
      static NAN_METHOD(Update);
      static NAN_METHOD(Digest);
      static NAN_GETTER(GetTotal);

      static Persistent<FunctionTemplate> constructor;
    private:
      NAN_INLINE IncrementalHasher(const uint32_t seed = 0U);
      NAN_INLINE IncrementalHasher(const uint8_t *serial);
      NAN_INLINE IncrementalHasher(const IncrementalHasher_T& other);
      NAN_INLINE void operator=(const IncrementalHasher_T&);
      NAN_INLINE void Serialize(uint8_t *serial);
      NAN_INLINE void Update(void *data, uint32_t length);
      NAN_INLINE void Digest(HashValueType *hash);
      static NAN_INLINE bool IsSerialTypeValid(uint8_t *serial);

      H<HashValueType,HashLength> hasher;
      uint32_t total;
  };

}

#endif