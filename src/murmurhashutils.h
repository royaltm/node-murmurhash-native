#if !defined(MURMURHASHUTILS_HEADER)
#define MURMURHASHUTILS_HEADER

#define FORCE_INLINE NAN_INLINE
#include "endianness.h"

namespace MurmurHash {
  using v8::Local;
  using v8::Value;

  namespace {
    template<int32_t HashLength, typename HashValueType>
    static void ReadHashBytesMSB(const uint8_t * in, HashValueType hashp[HashLength])
    {
      for(HashValueType * const hashend = hashp + HashLength ;;) {
        HashValueType val = (HashValueType) *(in++);
        for(int length = sizeof(HashValueType) ;--length; ) {
          val <<= 8;
          val |= (HashValueType) *(in++);
        }
        *(hashp++) = val;
        if (hashp == hashend) break;
      }
    }

    template<int32_t HashLength, typename HashValueType>
    static void WriteHashBytesPlatform(const HashValueType hashp[HashLength],
                    uint8_t * const out, int32_t length = HashSize, int32_t skip = 0)
    {
      // sanity check
      if (length <= 0) return;
      // normalize skip
      skip &= HashSize - 1;
      // normalize length
      length = std::min(length, HashSize - skip);
      std::memcpy((void *) out, (void *)( (uint8_t *) hashp + skip ), (size_t) length);
    }

    template<int32_t HashLength, typename HashValueType>
    static void WriteHashBytesMSB(const HashValueType hashp[HashLength],
                    uint8_t * const out, int32_t length = HashSize, int32_t skip = 0)
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
      const int shift = ((-(length + skip)) & ((int32_t) sizeof(HashValueType) - 1));
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
    static void WriteHashBytesLSB(const HashValueType hashp[HashLength],
                    uint8_t * out, int32_t length = HashSize, int32_t skip = 0)
    {
      // sanity check
      if (length <= 0) return;
      // normalize skip
      skip &= HashSize - 1;
      // normalize length
      length = std::min(length, HashSize - skip);
      // let hashp point to the first hash value
      hashp += skip / (int32_t) sizeof(HashValueType);
      // get first hash value
      HashValueType val = *(hashp++);
      // preliminary shift value when length is not aligned with hash value type
      const int shift = skip & ((int32_t) sizeof(HashValueType) - 1);
      val >>= 8 * shift;
      // set termination byte pointer at the end of output
      uint8_t * const outt = out + length;
      // get initial number of bytes to write for a single value
      length = std::min(length, (int32_t) sizeof(HashValueType) - shift);

      for(;; val = *(hashp++)) {
        for(;; val >>= 8) {
          *(out++) = (uint8_t) (val & 0x0ff);
          if (--length == 0) break;
        }
        length = std::min((int32_t)(outt - out), (int32_t) sizeof(HashValueType));
        if (length == 0) break;
      }
    }

    template<ByteOrderType OutputByteOrder, int32_t HashLength, typename HashValueType>
    NAN_INLINE static void WriteHashBytes(const HashValueType hashp[HashLength],
                    uint8_t * out, int32_t length = HashSize, int32_t skip = 0)
    {
      // constant folded
      if (OutputByteOrder == LSBFirst && IsBigEndian()) {
        WriteHashBytesLSB<HashLength>(hashp, out, length, skip);
      } else if (OutputByteOrder == MSBFirst && !IsBigEndian()) {
        WriteHashBytesMSB<HashLength>(hashp, out, length, skip);
      } else {
        WriteHashBytesPlatform<HashLength>(hashp, out, length, skip);
      }
    }

    template<ByteOrderType OutputByteOrder, int32_t HashLength, typename HashValueType>
    inline static Local<Value> HashToEncodedString(const HashValueType hashp[HashLength], enum Nan::Encoding enc)
    {
      Nan::EscapableHandleScope scope;

      Local<Value> result;

      // constant folded
      if (OutputByteOrder == LSBFirst && IsBigEndian()) {
        uint8_t str[HashSize];
        WriteHashBytesLSB<HashLength>(hashp, str);
        result = Nan::Encode((void *) str, (size_t) HashSize, enc);
      } else if (OutputByteOrder == MSBFirst && !IsBigEndian()) {
        uint8_t str[HashSize];
        WriteHashBytesMSB<HashLength>(hashp, str);
        result = Nan::Encode((void *) str, (size_t) HashSize, enc);
      } else {
        result = Nan::Encode((void *) hashp, (size_t) HashSize, enc);
      }

      return scope.Escape(result);
    }

    template<ByteOrderType OutputByteOrder, int32_t HashLength, typename HashValueType>
    inline static void WriteHashToBuffer(const HashValueType hashp[HashLength],
                                          char * const bufptr, int32_t bufsize,
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
      WriteHashBytes<OutputByteOrder, HashLength>(hashp, (uint8_t *) bufptr + offset, length, skip);
    }

    NAN_INLINE static char ToLower(const char c) {
      return c >= 'A' && c <= 'Z' ? c + ('a' - 'A') : c;
    }

    static bool StringEqualLower(const char* a, const char* b) {
      do {
        if (*a == '\0')
          return *b == '\0';
        if (*b == '\0') break;
      } while (ToLower(*a++) == *b++);
      return false;
    }

  }
}

#endif