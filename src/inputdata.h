#if !defined(INPUTDATA_HEADER)
#define INPUTDATA_HEADER

#ifndef NODE_MURMURHASH_KEY_BUFFER_SIZE
#  define NODE_MURMURHASH_KEY_BUFFER_SIZE 1024
#endif

namespace MurmurHash {
  using v8::Handle;
  using v8::Local;
  using v8::Value;
  using v8::Object;
  using v8::String;

  class InputData {
    public:

      enum Type {
        Static, Own, ExternalBuffer
      };

      NAN_INLINE InputData(bool allowStaticBuffer = true);
      NAN_INLINE void Setup(Local<Value> key, const Local<String> &encodingStr);
      NAN_INLINE void Setup(Local<Value> key);
      NAN_INLINE bool IsValid() const;
      NAN_INLINE bool IsFromBuffer() const;
      NAN_INLINE const char * Error() const;
      NAN_INLINE size_t length() const;
      NAN_INLINE char* operator*();
      NAN_INLINE const char* operator*() const;
      NAN_INLINE ~InputData();
      NAN_INLINE static Nan::Encoding DetermineEncoding(const Local<String> &encodingStr);

    private:
      bool useStatic;
      char *buffer;
      size_t size;
      Type type;
      const char *error;

      NAN_INLINE void reset(char *buf = NULL, size_t siz = 0, Type t = Static);
      NAN_INLINE void InitFromBuffer(const Handle<Object> keyObject);
      NAN_INLINE char *EnsureBuffer(size_t bytelength, Type& type);

      NAN_INLINE static char *StaticKeyBuffer();
      static char keyBuffer[NODE_MURMURHASH_KEY_BUFFER_SIZE];

      InputData(const InputData&);
      void operator=(const InputData&);
  };

}

#include "inputdata_impl.h"

#endif