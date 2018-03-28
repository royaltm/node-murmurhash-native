#if !defined(ASYNCUPDATE_HEADER)
# error 'asyncupdate_impl.h' is not supposed to be included directly. Include 'asyncupdate.h' instead.
#endif

namespace MurmurHash {
  namespace {
    enum { kInputBufferIndex };
  }

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  NAN_INLINE IncrementalHashUpdater<H,HashValueType,HashLength>
  ::IncrementalHashUpdater(
                Nan::Callback *callback,
                IncrementalHasher_T* hasher,
                Local<Value> key, const enum Nan::Encoding encoding)
              : Nan::AsyncWorker(callback), data_(hasher->dataBuffer), hasher_(hasher)
  {
    data_.Setup(key, encoding);
    if (data_.IsFromBuffer())
      SaveToPersistent(kInputBufferIndex, key);
  }

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  void IncrementalHashUpdater<H,HashValueType,HashLength>
  ::Execute()
  {
    if ( ! data_.IsValid() )
      return SetErrorMessage(data_.Error());

    hasher_->Update( (const void *) *data_, (int32_t) data_.length() );
  }

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  void IncrementalHashUpdater<H,HashValueType,HashLength>
  ::HandleOKCallback()
  {
    hasher_->AsyncUpdateComplete();

    Nan::AsyncWorker::HandleOKCallback();
  }

  template<template <typename,int32_t>class H, typename HashValueType, int32_t HashLength>
  void IncrementalHashUpdater<H,HashValueType,HashLength>
  ::HandleErrorCallback()
  {
    Nan::HandleScope scope;

    hasher_->AsyncUpdateComplete();

    Local<Value> argv[] = {
      v8::Exception::TypeError(Nan::New<String>(ErrorMessage()).ToLocalChecked())
    };
    callback->Call(1, argv, async_resource);
  }

}
