#if !defined(INPUTDATA_HEADER)
# error 'inputdata_impl.h' is not supposed to be included directly. Include 'inputdata.h' instead.
#endif

namespace MurmurHash {

  NAN_INLINE InputData::InputData() : buffer(NULL), size(0), ownBuffer(false) {}

  NAN_INLINE void InputData::Setup(
      Handle<Value> key, const Handle<String> encodingStr)
  {
    if ( key->IsString() ) {
      const enum Nan::Encoding enc = DetermineEncoding(encodingStr);
#if  (NODE_MODULE_VERSION < 0x000B)
      /* v0.8's node::DecodeWrite returns incorrect utf8 size */
      ssize_t maxLength = NanDecodeBytes(key, enc);
#else
      ssize_t maxLength = enc == Nan::UTF8
                            ? 3 * key.As<String>()->Length()
                            : NanDecodeBytes(key, enc);
#endif
      if ( maxLength != -1 ) {
        char *data = EnsureBuffer((size_t) maxLength);
        size = (size_t) NanDecodeWrite( data, maxLength, key, enc );
      }
    } else if ( node::Buffer::HasInstance(key) ) {
      InitFromBuffer( key.As<Object>() );
    }
  }

  NAN_INLINE void InputData::Setup(Handle<Value> key)
  {
    if ( key->IsString() ) {
      size_t length = (size_t) key.As<String>()->Length();
      char *data = EnsureBuffer(length);
      size = (size_t) NanDecodeWrite( data, length, key );
    } else if ( node::Buffer::HasInstance(key) ) {
      InitFromBuffer( key.As<Object>() );
    }
  }

  NAN_INLINE bool InputData::IsValid(void)
  {
    return buffer != NULL;
  }

  NAN_INLINE void InputData::InitFromBuffer(const Handle<Object> keyObject)
  {
    size = node::Buffer::Length(keyObject);
    buffer = node::Buffer::Data(keyObject);
    if ( size == 0 )
      EnsureBuffer(0);
  }

  NAN_INLINE Nan::Encoding InputData::DetermineEncoding(
      const Handle<String> encodingStr)
  {
    char encCstr[sizeof("utf-16le")];
    int length = encodingStr->Length();

    if ( length > 0 && length <= (int)(sizeof(encCstr) - 1) ) {

      encCstr[NanDecodeWrite(encCstr, sizeof(encCstr) - 1, encodingStr)] = 0;

      if ( length > 6 ) {
        if ( strcasecmp(encCstr, "utf16le") == 0 ||
             strcasecmp(encCstr, "utf-16le") == 0 )
          return Nan::UCS2;
      } else if ( length == 6 ) {
        if ( strcasecmp(encCstr, "base64") == 0 )
          return Nan::BASE64;
        if ( strcasecmp(encCstr, "binary") == 0 )
          return Nan::BINARY;
      } else if ( length >= 5 ) {
        if ( strcasecmp(encCstr, "ascii") == 0 ) {
          return Nan::ASCII;
        } else if ( strcasecmp(encCstr, "utf-8") == 0 ) {
          return Nan::UTF8;
        } else if ( strcasecmp(encCstr, "ucs-2") == 0 ) {
          return Nan::UCS2;
        }
      } else if ( length >= 4 ) {
        if ( strcasecmp(encCstr, "utf8") == 0 ) {
          return Nan::UTF8;
        } else if ( strcasecmp(encCstr, "ucs2") == 0 ) {
          return Nan::UCS2;
        }
      }
      if ( strcasecmp(encCstr, "hex") == 0 )
        return Nan::HEX;
    }
    return Nan::BINARY;
  }

  NAN_INLINE size_t InputData::length() const { return size; }

  NAN_INLINE char* InputData::operator*() { return buffer; }

  NAN_INLINE const char* InputData::operator*() const { return buffer; }

  NAN_INLINE InputData::~InputData()
  {
    if ( ownBuffer ) delete[] buffer;
  }

  NAN_INLINE char *InputData::EnsureKeyBuffer(size_t)
  {
    return keyBuffer;
  }

  NAN_INLINE char *InputData::EnsureBuffer(size_t bytelength)
  {
    if ( bytelength > NODE_MURMURHASH_KEY_BUFFER_SIZE ) {
      ownBuffer = true;
      return buffer = new char[bytelength];
    }
    return buffer = EnsureKeyBuffer(bytelength);
  }

  char InputData::keyBuffer[NODE_MURMURHASH_KEY_BUFFER_SIZE];

}
