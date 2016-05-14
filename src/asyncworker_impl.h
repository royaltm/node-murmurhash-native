#if !defined(MURMURHASH_ASYNC_HEADER)
# error 'asyncworker_impl.h' is not supposed to be included directly. Include 'inputdata.h' instead.
#endif

namespace MurmurHash {
  template<MurmurHashFunctionType HashFunction, typename HashValueType, ssize_t HashLength>
  NAN_INLINE MurmurHashWorker<HashFunction,HashValueType,HashLength>
  ::MurmurHashWorker(
                Nan::Callback *callback)
              : Nan::AsyncWorker(callback), outputType_(UnknownOutputType), seed_(0), data_(false) {}

  template<MurmurHashFunctionType HashFunction, typename HashValueType, ssize_t HashLength>
  NAN_INLINE MurmurHashWorker<HashFunction,HashValueType,HashLength>
  ::MurmurHashWorker(
                Nan::Callback *callback, OutputType outputType, uint32_t seed,
                Local<Value> key, const Local<String> &encodingStr)
              : Nan::AsyncWorker(callback), outputType_(outputType), seed_(seed), data_(false)
              // bufptr_(NULL), bufsize_(0), offset_(0), length_(0)
  {
    data_.Setup(key, encodingStr);
    if (data_.IsFromBuffer())
      SaveToPersistent(0U, key);    
  }

  template<MurmurHashFunctionType HashFunction, typename HashValueType, ssize_t HashLength>
  NAN_INLINE MurmurHashWorker<HashFunction,HashValueType,HashLength>
  ::MurmurHashWorker(
                Nan::Callback *callback, OutputType outputType, uint32_t seed,
                Local<Value> key)
              : Nan::AsyncWorker(callback), outputType_(outputType), seed_(seed), data_(false)
              // bufptr_(NULL), bufsize_(0), offset_(0), length_(0)
  {
    data_.Setup(key);
    if (data_.IsFromBuffer())
      SaveToPersistent(0U, key);    
  }

  template<MurmurHashFunctionType HashFunction, typename HashValueType, ssize_t HashLength>
  NAN_INLINE void MurmurHashWorker<HashFunction,HashValueType,HashLength>
  ::SaveOutputBuffer(
                const Local<Value> &buffer, ssize_t offset, ssize_t length)
  {
    SaveToPersistent(1U, buffer);
    bufptr_ = node::Buffer::Data(buffer);
    bufsize_ = (ssize_t) node::Buffer::Length(buffer);
    offset_ = offset;
    length_ = length;
  }

  template<MurmurHashFunctionType HashFunction, typename HashValueType, ssize_t HashLength>
  NAN_INLINE void MurmurHashWorker<HashFunction,HashValueType,HashLength>
  ::Execute()
  {
    if ( ! data_.IsValid() )
      return SetErrorMessage(data_.Error());

    switch(outputType_) {
      case ProvidedBufferOutputType:
        MurmurHashBuffer<HashFunction, HashValueType, HashLength>(
              data_, seed_, bufptr_, bufsize_, offset_, length_);
        break;

      case NumberOutputType:
      case BufferOutputType:
        HashFunction( (const void *) *data_, (int) data_.length(), seed_, (void *)hash_ );
        break;

      default:
        SetErrorMessage("Unknown output type: should be \"number\" or \"buffer\"");
    }
  }

  template<MurmurHashFunctionType HashFunction, typename HashValueType, ssize_t HashLength>
  NAN_INLINE void MurmurHashWorker<HashFunction,HashValueType,HashLength>
  ::HandleOKCallback()
  {
    Nan::HandleScope scope;
    Local<Value> argv[2] = { Nan::Null() };

    switch(outputType_) {
      case ProvidedBufferOutputType:
        argv[1] = Nan::AsyncWorker::GetFromPersistent(1U);
        break;

      case NumberOutputType:
        if (HashSize == sizeof(uint32_t)) {
          argv[1] = Nan::New<Uint32>( (uint32_t) hash_[0] );
        } else {
          argv[1] = HashToHexString<HashLength>( hash_ );
        }
        break;

      case BufferOutputType:
        argv[1] = Nan::CopyBuffer((char *) hash_, (uint32_t) HashSize).ToLocalChecked();
        break;

      default:
        void(0);
    }

    callback->Call(2, argv);
  }

  template<MurmurHashFunctionType HashFunction, typename HashValueType, ssize_t HashLength>
  NAN_INLINE void MurmurHashWorker<HashFunction,HashValueType,HashLength>
  ::HandleErrorCallback() {
    Nan::HandleScope scope;

    Local<Value> argv[] = {
      v8::Exception::TypeError(Nan::New<String>(ErrorMessage()).ToLocalChecked())
    };
    callback->Call(1, argv);
  }
}
