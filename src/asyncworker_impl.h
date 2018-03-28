#if !defined(ASYNCWORKER_HEADER)
# error 'asyncworker_impl.h' is not supposed to be included directly. Include 'asyncworker.h' instead.
#endif

namespace MurmurHash {
  namespace {
    enum { kInputBufferIndex, kOutputBufferIndex };
  }

  template<MurmurHashFunctionType HashFunction, typename HashValueType, int32_t HashLength, ByteOrderType OutputByteOrder>
  NAN_INLINE MurmurHashWorker<HashFunction,HashValueType,HashLength,OutputByteOrder>
  ::MurmurHashWorker(
                Nan::Callback *callback)
              : Nan::AsyncWorker(callback), data_(dataBuffer), outputType_(UnknownOutputType), seed_(0) {}

  template<MurmurHashFunctionType HashFunction, typename HashValueType, int32_t HashLength, ByteOrderType OutputByteOrder>
  NAN_INLINE MurmurHashWorker<HashFunction,HashValueType,HashLength,OutputByteOrder>
  ::MurmurHashWorker(
                Nan::Callback *callback, const OutputType outputType, const uint32_t seed,
                Local<Value> key, const enum Nan::Encoding encoding, const bool validEncoding)
              : Nan::AsyncWorker(callback), data_(dataBuffer), outputType_(outputType), seed_(seed)
              // offset_(0), length_(0)
  {
    data_.Setup(key, encoding, validEncoding);
    if (data_.IsFromBuffer())
      SaveToPersistent(kInputBufferIndex, key);
  }

  template<MurmurHashFunctionType HashFunction, typename HashValueType, int32_t HashLength, ByteOrderType OutputByteOrder>
  NAN_INLINE void MurmurHashWorker<HashFunction,HashValueType,HashLength,OutputByteOrder>
  ::SaveOutputBuffer(
                const Local<Value> &buffer, int32_t offset, int32_t length)
  {
    SaveToPersistent(kOutputBufferIndex, buffer);
    offset_ = offset;
    length_ = length;
  }

  template<MurmurHashFunctionType HashFunction, typename HashValueType, int32_t HashLength, ByteOrderType OutputByteOrder>
  void MurmurHashWorker<HashFunction,HashValueType,HashLength,OutputByteOrder>
  ::Execute()
  {
    if ( ! data_.IsValid() )
      return SetErrorMessage(data_.Error());

    switch(outputType_) {
      case DefaultOutputType:
      case NumberOutputType:
      case HexStringOutputType:
      case BinaryStringOutputType:
      case Base64StringOutputType:
      case BufferOutputType:
      case ProvidedBufferOutputType:
        HashFunction( (const void *) *data_, (int) data_.length(), seed_, (void *)hash_ );
        break;

      default:
        SetErrorMessage("Unknown output type: should be \"number\", \"buffer\", \"binary\", \"base64\" or \"hex\"");
    }
  }

  template<MurmurHashFunctionType HashFunction, typename HashValueType, int32_t HashLength, ByteOrderType OutputByteOrder>
  void MurmurHashWorker<HashFunction,HashValueType,HashLength,OutputByteOrder>
  ::HandleOKCallback()
  {
    Nan::HandleScope scope;
    Local<Value> argv[2] = { Nan::Null() };

    switch(outputType_) {
      case DefaultOutputType:
      case NumberOutputType:
        if (HashSize == sizeof(uint32_t)) {
          argv[1] = Nan::New<Uint32>( (uint32_t) hash_[0] );
        } else {
          argv[1] = HashToEncodedString<OutputByteOrder, HashLength>( hash_, Nan::HEX );
        }
        break;

      case HexStringOutputType:
        argv[1] = HashToEncodedString<OutputByteOrder, HashLength>( hash_, Nan::HEX );
        break;

      case BinaryStringOutputType:
        argv[1] = HashToEncodedString<OutputByteOrder, HashLength>( hash_, Nan::BINARY );
        break;

      case Base64StringOutputType:
        argv[1] = HashToEncodedString<OutputByteOrder, HashLength>( hash_, Nan::BASE64 );
        break;

      case BufferOutputType:
        argv[1] = Nan::NewBuffer( HashSize ).ToLocalChecked();
        WriteHashBytes<OutputByteOrder, HashLength>(hash_, (uint8_t *) node::Buffer::Data(argv[1]));
        break;

      case ProvidedBufferOutputType:
        argv[1] = GetFromPersistent(kOutputBufferIndex);
        WriteHashToBuffer<OutputByteOrder, HashLength>(
              hash_,
              node::Buffer::Data(argv[1]),
              (int32_t) node::Buffer::Length(argv[1]),
              offset_,
              length_);
        break;

      default:
        void(0);
    }

    callback->Call(2, argv, async_resource);
  }

  template<MurmurHashFunctionType HashFunction, typename HashValueType, int32_t HashLength, ByteOrderType OutputByteOrder>
  void MurmurHashWorker<HashFunction,HashValueType,HashLength,OutputByteOrder>
  ::HandleErrorCallback() {
    Nan::HandleScope scope;

    Local<Value> argv[] = {
      v8::Exception::TypeError(Nan::New<String>(ErrorMessage()).ToLocalChecked())
    };
    callback->Call(1, argv, async_resource);
  }
}
