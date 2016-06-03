#if !defined(INPUTDATA_HEADER)
#define INPUTDATA_HEADER

#ifndef NODE_MURMURHASH_KEY_BUFFER_SIZE
#  define NODE_MURMURHASH_KEY_BUFFER_SIZE 1024
#endif

namespace MurmurHash {
  using v8::Local;
  using v8::Value;
  using v8::String;

  class InputData {
    public:

      enum Type {
        Static, Own, ExternalBuffer
      };

      NAN_INLINE InputData(char staticBuffer[NODE_MURMURHASH_KEY_BUFFER_SIZE] = keyBuffer);
      NAN_INLINE void Setup(Local<Value> key, const enum Nan::Encoding encoding, const bool validEncoding = true);
      NAN_INLINE bool IsValid() const;
      NAN_INLINE bool IsFromBuffer() const;
      NAN_INLINE const char * Error() const;
      NAN_INLINE size_t length() const;
      NAN_INLINE char* operator*();
      NAN_INLINE const char* operator*() const;
      NAN_INLINE ~InputData();
      NAN_INLINE static void ReadEncodingString(const Local<String>& type);
      static bool DetermineEncoding(enum Nan::Encoding& enc);
      static OutputType DetermineOutputType();

    private:
      char *staticBufferPtr;
      char *buffer;
      size_t size;
      Type type;
      const char *error;

      NAN_INLINE void reset(char *buf = NULL, size_t siz = 0, Type t = Static);
      NAN_INLINE char *EnsureBuffer(size_t bytelength, Type& type);

      static char keyBuffer[NODE_MURMURHASH_KEY_BUFFER_SIZE];
      static char encCstr[sizeof("utf-16le")];

      InputData(const InputData&);
      void operator=(const InputData&);
  };

}

#include "inputdata_impl.h"

#endif