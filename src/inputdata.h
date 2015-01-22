#if !defined(INPUTDATA_HEADER)
#define INPUTDATA_HEADER

#ifndef NODE_MURMURHASH_KEY_BUFFER_SIZE
#  define NODE_MURMURHASH_KEY_BUFFER_SIZE 1024
#endif

namespace MurmurHash {
  using v8::Handle;
  using v8::Value;

  class InputData {
    public:
      NAN_INLINE InputData();
      NAN_INLINE void Setup(const Handle<Value> &key, const Handle<Value> &encoding_v);
      NAN_INLINE void Setup(const Handle<Value> &key);
      NAN_INLINE bool IsValid(void);
      NAN_INLINE size_t length() const;
      NAN_INLINE char* operator*();
      NAN_INLINE const char* operator*() const;
      NAN_INLINE ~InputData();
      NAN_INLINE static Nan::Encoding DetermineEncoding(const Handle<Value> &encoding_v);

    private:
      char *buffer;
      size_t size;
      bool ownBuffer;

      NAN_INLINE void InitFromBuffer(const Handle<Value> &key);
      NAN_INLINE char *EnsureBuffer(size_t bytelength);

      NAN_INLINE static char *EnsureKeyBuffer(size_t bytelength);
      static char keyBuffer[NODE_MURMURHASH_KEY_BUFFER_SIZE];

      InputData(const InputData&);
      void operator=(const InputData&);
  };

}

#include "inputdata_impl.h"

#endif