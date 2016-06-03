#if !defined(ASYNCUPDATE_HEADER)
#define ASYNCUPDATE_HEADER

namespace MurmurHash {
  using v8::Local;
  using v8::Value;

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  class IncrementalHashUpdater : public Nan::AsyncWorker {
    public:
        typedef IncrementalHasher<H,HashValueType,HashLength> IncrementalHasher_T;

        NAN_INLINE IncrementalHashUpdater(Nan::Callback *callback,
                    IncrementalHasher_T* hasher,
                    Local<Value> key, const enum Nan::Encoding encoding);
        void Execute();
        void HandleOKCallback();
        void HandleErrorCallback();

    private:
        InputData data_;
        IncrementalHasher_T *hasher_;
  };

}

#include "asyncupdate_impl.h"

#endif