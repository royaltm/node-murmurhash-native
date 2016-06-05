#if !defined(INPUTDATA_HEADER)
# error 'inputdata_impl.h' is not supposed to be included directly. Include 'inputdata.h' instead.
#endif

namespace MurmurHash {

  NAN_INLINE InputData::InputData(char *staticBuffer) : staticBufferPtr(staticBuffer),
                buffer(NULL), size(0), type(Static), error("string or Buffer is required") {}

  NAN_INLINE void InputData::Setup(Local<Value> key, const enum Nan::Encoding encoding, const bool validEncoding)
  {
    if ( !validEncoding ) {
      error = "\"encoding\" must be a valid string encoding";
      return;
    }
    if ( encoding == Nan::BUFFER) {
      if ( node::Buffer::HasInstance(key) ) {
        reset(
          node::Buffer::Data(key),
          node::Buffer::Length(key),
          ExternalBuffer);
      }
    } else {
      ssize_t maxLength = (encoding == Nan::UTF8)
                          ? 3 * key.As<String>()->Length()
                          : Nan::DecodeBytes(key, encoding);
      if ( maxLength != -1 ) {
        Type type;
        char *data = EnsureBuffer((size_t) maxLength, type);
        reset(data, (size_t) Nan::DecodeWrite( data, maxLength, key, encoding ), type);
      }
    }
  }

  NAN_INLINE const char * InputData::Error(void) const
  {
    return error;
  }

  NAN_INLINE bool InputData::IsValid(void) const
  {
    return buffer != NULL;
  }

  NAN_INLINE bool InputData::IsFromBuffer(void) const
  {
    return type == ExternalBuffer;
  }

  NAN_INLINE size_t InputData::length() const { return size; }

  NAN_INLINE void InputData::reset(char *buf, size_t siz, Type t)
  {
    if ( type == Own ) delete[] buffer;

    if ( siz == 0 || buf == NULL ) {
      size = 0;
      type = t;
      if ( t == ExternalBuffer ) {
        buffer = staticBufferPtr;
      } else {
        buffer = buf;
      }
    } else {
      buffer = buf;
      size = siz;
      type = t;
    }
  }

  NAN_INLINE char* InputData::operator*() { return buffer; }

  NAN_INLINE const char* InputData::operator*() const { return buffer; }

  NAN_INLINE InputData::~InputData()
  {
    if ( type == Own ) delete[] buffer;
  }

  NAN_INLINE void InputData::ReadEncodingString(const Local<String>& type)
  {
    size_t length = type->Length();
    if ( length < sizeof(encCstr) ) {
      encCstr[Nan::DecodeWrite(encCstr, length, type)] = 0;
    } else
      encCstr[0] = 0;
  }

  bool InputData::DetermineEncoding(enum Nan::Encoding& enc)
  {
    if ( StringEqualLower(encCstr, "utf16le") ||
         StringEqualLower(encCstr, "utf-16le") ) {
      enc = Nan::UCS2;
      return true;
    } else if ( StringEqualLower(encCstr, "base64") ) {
      enc = Nan::BASE64;
      return true;
    } else if ( StringEqualLower(encCstr, "binary") ) {
      enc = Nan::BINARY;
      return true;
    } else if ( StringEqualLower(encCstr, "ascii") ) {
      enc = Nan::ASCII;
      return true;
    } else if ( StringEqualLower(encCstr, "utf-8") ) {
      enc = Nan::UTF8;
      return true;
    } else if ( StringEqualLower(encCstr, "ucs-2") ) {
      enc = Nan::UCS2;
      return true;
    } else if ( StringEqualLower(encCstr, "utf8") ) {
      enc = Nan::UTF8;
      return true;
    } else if ( StringEqualLower(encCstr, "ucs2") ) {
      enc = Nan::UCS2;
      return true;
    } else if ( StringEqualLower(encCstr, "hex") ) {
      enc = Nan::HEX;
      return true;
    }
    return false;
  }

  OutputType InputData::DetermineOutputType()
  {
    if ( StringEqualLower(encCstr, "buffer") ) {
      return BufferOutputType;
    } else if ( StringEqualLower(encCstr, "number") ) {
      return NumberOutputType;
    } else if ( StringEqualLower(encCstr, "base64") ) {
      return Base64StringOutputType;
    } else if ( StringEqualLower(encCstr, "binary") ) {
      return BinaryStringOutputType;
    } else if ( StringEqualLower(encCstr, "hex") ) {
      return HexStringOutputType;
    }

    return UnknownOutputType;
  }

  NAN_INLINE char *InputData::EnsureBuffer(size_t bytelength, Type& type)
  {
    if ( bytelength <= NODE_MURMURHASH_KEY_BUFFER_SIZE ) {
      type = Static;
      return staticBufferPtr;
    } else {
      type = Own;
      return new char[bytelength];
    }
  }

  char InputData::keyBuffer[NODE_MURMURHASH_KEY_BUFFER_SIZE];
  char InputData::encCstr[sizeof("utf-16le")];
}
