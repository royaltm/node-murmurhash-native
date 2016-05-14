#if !defined(MURMURHASH_ASYNC_HEADER)
#define MURMURHASH_ASYNC_HEADER

namespace MurmurHash {
  using v8::Handle;
  using v8::Local;
  using v8::Value;
  using v8::Object;
  using v8::String;
  using v8::Uint32;

  template<MurmurHashFunctionType HashFunction, typename HashValueType, ssize_t HashLength>
  class MurmurHashWorker : public Nan::AsyncWorker {
    public:
        NAN_INLINE MurmurHashWorker(Nan::Callback *callback);
        NAN_INLINE MurmurHashWorker(Nan::Callback *callback, OutputType outputType, uint32_t seed,
                                      Local<Value> key);
        NAN_INLINE MurmurHashWorker(Nan::Callback *callback, OutputType outputType, uint32_t seed,
                                    Local<Value> key, const Local<String> &encodingStr);
        void SaveOutputBuffer(const Local<Value> &buffer, ssize_t offset, ssize_t length);
        void Execute();
        void HandleOKCallback();
        void HandleErrorCallback();

    private:
        OutputType outputType_;
        uint32_t seed_;
        InputData data_;
        char *bufptr_;
        ssize_t bufsize_;
        ssize_t offset_;
        ssize_t length_;
        HashValueType hash_[HashLength];
  };

}

#include "asyncworker_impl.h"

#endif