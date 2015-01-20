#if !defined(INPUTDATA_HEADER)
#define INPUTDATA_HEADER

#include <node.h>
#include <v8.h>
#include <nan.h>

#ifndef NODE_MURMURHASH_KEY_BUFFER_SIZE
#  define NODE_MURMURHASH_KEY_BUFFER_SIZE 1024
#endif

namespace MurmurHash {
  using v8::Handle;
  using v8::Value;

  class InputData {
    public:
      InputData();
      void Setup(const Handle<Value> &key, const Handle<Value> &encoding_v);
      void Setup(const Handle<Value> &key);
      bool IsValid(void);
      size_t length() const;
      char* operator*();
      const char* operator*() const;
      ~InputData();
      NAN_INLINE static Nan::Encoding DetermineEncoding(const Handle<Value> &encoding_v);

    private:
      bool ownBuffer;
      char *buffer;
      size_t size;

      NAN_INLINE void InitFromBuffer(const Handle<Value> &key);
      NAN_INLINE char *EnsureBuffer(size_t bytelength);

      NAN_INLINE static char *EnsureKeyBuffer(size_t bytelength);
      static char keyBuffer[NODE_MURMURHASH_KEY_BUFFER_SIZE];

      InputData(const InputData&);
      void operator=(const InputData&);
  };

}

#endif