#if !defined(INCREMENTAL_HASHER_HEADER)
#define INCREMENTAL_HASHER_HEADER

#include "nodemurmurhash.h"

namespace MurmurHash {
  using v8::FunctionTemplate;
  using Nan::Persistent;
  using Nan::ObjectWrap;

  NAN_MODULE_INIT(Init);

  template<class H, typename HashValueType, ssize_t HashLength>
  class IncrementalHasher : public ObjectWrap {
    public:
      typedef IncrementalHasher<H,HashValueType,HashLength> IncrementalHasher_T;

      IncrementalHasher(uint32_t seed);
      NAN_INLINE void Update(void *data, int32_t length);
      NAN_INLINE void Digest(HashValueType *hash);

      static NAN_METHOD(New);
      static NAN_METHOD(Copy);
      static NAN_METHOD(Update);
      static NAN_METHOD(Digest);
      static NAN_GETTER(GetTotal);

      static Persistent<FunctionTemplate> constructor;
    private:
      H hasher;
      int32_t total;

      IncrementalHasher(const IncrementalHasher&);
      void operator=(const IncrementalHasher&);
  };

}

#endif