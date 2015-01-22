#if !defined(NanStringWriteBytes)
#  if (NODE_MODULE_VERSION > 0x000B)
#    define NanStringWriteBytes(v8string, ...) \
            (v8string)->WriteOneByte((uint8_t*)__VA_ARGS__)
#  else
#    define NanStringWriteBytes(v8string, ...) \
            (v8string)->WriteAscii(__VA_ARGS__)
#  endif
#endif

#if !defined(NanEncode)
NAN_INLINE v8::Local<v8::Value> NanEncode(
    const void *buf, size_t len, enum Nan::Encoding encoding = Nan::BINARY) {
#if (NODE_MODULE_VERSION > 0x000B)
  return node::Encode(
      v8::Isolate::GetCurrent()
    , buf, len
    , static_cast<node::encoding>(encoding));
#else
# if  (NODE_MODULE_VERSION < 0x000B)
  if (encoding == Nan::BUFFER) {
    assert(len <= node::Buffer::kMaxLength);
    return v8::Local<v8::Value>::New(node::Buffer::New(
        static_cast<char *>(const_cast<void *>(buf)), len)->handle_);
  }
# endif
  return node::Encode(buf, len, static_cast<node::encoding>(encoding));
#endif
}
#endif

#if !defined(NanDecodeBytes)
NAN_INLINE ssize_t NanDecodeBytes(
    v8::Handle<v8::Value> val, enum Nan::Encoding encoding = Nan::BINARY) {
#if (NODE_MODULE_VERSION > 0x000B)
  return node::DecodeBytes(
      v8::Isolate::GetCurrent()
    , val
    , static_cast<node::encoding>(encoding));
#else
# if (NODE_MODULE_VERSION < 0x000B)
  if (encoding == Nan::BUFFER) {
    return node::DecodeBytes(val, node::BINARY);
  }
# endif
  return node::DecodeBytes(val, static_cast<node::encoding>(encoding));
#endif
}
#endif

#if !defined(NanDecodeWrite)
NAN_INLINE ssize_t NanDecodeWrite(
    char *buf
  , size_t len
  , v8::Handle<v8::Value> val
  , enum Nan::Encoding encoding = Nan::BINARY) {
#if (NODE_MODULE_VERSION > 0x000B)
  return node::DecodeWrite(
      v8::Isolate::GetCurrent()
    , buf
    , len
    , val
    , static_cast<node::encoding>(encoding));
#else
# if (NODE_MODULE_VERSION < 0x000B)
  if (encoding == Nan::BUFFER) {
    return node::DecodeWrite(buf, len, val, node::BINARY);
  }
# endif
  return node::DecodeWrite(
      buf
    , len
    , val
    , static_cast<node::encoding>(encoding));
#endif
}
#endif
