#if !defined(MURMURHASHUTILS_HEADER)
#define MURMURHASHUTILS_HEADER

namespace MurmurHash {
  using v8::Local;
  using v8::Value;
  using v8::String;

  #define HEXSTR_SIZE 2

  template<typename T>
  NAN_INLINE char *WriteHexString(T value, char * const out)
  {
    static const char hex[]= "0123456789abcdef";
    char * const endp = out + (sizeof(value) * HEXSTR_SIZE);
    for(char * ptr = endp ; ; value >>= 4) {
      *(--ptr) = hex[value & 0x0f];
      value >>= 4;
      *(--ptr) = hex[value & 0x0f];
      if (ptr == out) break;
    }
    return endp;
  }

  template<int32_t HashLength, typename HashValueType>
  Local<Value> HashToHexString(const HashValueType * hash)
  {
    Nan::EscapableHandleScope scope;

    char str[HashSize * HEXSTR_SIZE];
    char *out = str;

    const HashValueType * const valt = hash + HashLength;
    const HashValueType * valp = hash;
    while(valp < valt) {
      out = WriteHexString( *(valp++), out );
    }

    return scope.Escape(Nan::New<String>(str, (HashSize * HEXSTR_SIZE)).ToLocalChecked());
  }

  #undef HEXSTR_SIZE

  template<int32_t HashLength, typename HashValueType>
  void WriteHashBytes(const HashValueType * hashp, uint8_t * out, int32_t length = HashSize, int32_t skip = 0)
  {
    // sanity check
    if (length <= 0) return;
    // normalize skip
    skip &= HashSize - 1;
    // normalize length
    length = std::min(length, HashSize - skip);
    // let hashp point to the last hash value
    hashp += (length + skip - 1) / (int32_t) sizeof(HashValueType);
    // get first hash value
    HashValueType val = *(hashp--);
    // preliminary shift value when length is not aligned with hash value type
    int shift = ((-(length + skip)) & ((int32_t) sizeof(HashValueType) - 1));
    val >>= 8 * shift;
    // set byte pointer at the end of output
    uint8_t * outp = out + length;
    // get initial number of bytes to write for a single value
    length = std::min(length, (int32_t) sizeof(HashValueType) - shift);

    for(;; val = *(hashp--)) {
      for(;; val >>= 8) {
        *(--outp) = (uint8_t) (val & 0x0ff);
        if (--length == 0) break;
      }
      length = std::min((int32_t)(outp - out), (int32_t) sizeof(HashValueType));
      if (length == 0) break;
    }
  }

  template<int32_t HashLength, typename HashValueType>
  Local<Value> HashToEncodedString(const HashValueType * hash, enum Nan::Encoding enc)
  {
    Nan::EscapableHandleScope scope;

    uint8_t str[HashSize];

    WriteHashBytes<HashLength>(hash, str);

    return scope.Escape(Nan::Encode((void *) str, (size_t) HashSize, enc));
  }

  template<int32_t HashLength, typename HashValueType>
  NAN_INLINE void WriteHashToBuffer(const HashValueType * hash,
                                    char *bufptr, int32_t bufsize,
                                    int32_t offset, int32_t length)
  {
    int32_t skip = 0;

    // normalize
    length = std::max(-HashSize, std::min(HashSize, length));

    // negative length is counted from the end of the hash
    if (length < 0) {
      skip = length;
      length = -length;
    }

    // negative offset is counted from the end of the buffer
    if ( offset < 0 ) {
      offset += bufsize;
    }

    // still negative
    if ( offset < 0 ) {
      length += offset;
      skip -= offset;
      offset = 0;
    }

    length = std::min(length, bufsize - offset);
    WriteHashBytes<HashLength>(hash, (uint8_t *) bufptr + offset, length, skip);
  }

}

#endif