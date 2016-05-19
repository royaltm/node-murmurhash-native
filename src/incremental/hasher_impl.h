#if !defined(INCREMENTAL_HASHER_IMPL_HEADER)
#define INCREMENTAL_HASHER_IMPL_HEADER

#include "PMurHash.h"
#include "PMurHash128.h"

#define BASE64_ENCODED_SIZE(size) ((size + 2 - ((size + 2) % 3)) / 3 * 4)

#define HashSerialSize (HashSize * 2 + static_cast<int32_t>(sizeof(uint32_t)))
#define HashSerialStringSize BASE64_ENCODED_SIZE(HashSerialSize)

#define HashSerialHStateIndex 0
#define HashSerialCarryIndex (HashSerialHStateIndex + HashSize)
// Serial data in network byte order
//          0: hstate[MSByte] ... hstate[LSByte]
//   HashSize:  carry[MSByte] ... carry[LSByte]
// 2*HashSize:  total[MSByte] ... total[LSByte]

namespace MurmurHash {
  template<typename HashValueType, int32_t HashLength>
  class IncrementalMurmurHash3A {
    public:
      NAN_INLINE IncrementalMurmurHash3A(const uint32_t seed = 0) : hstate(seed), carry(0) {}
      NAN_INLINE IncrementalMurmurHash3A(const uint8_t *serial)
      {
        ReadHashBytes<HashLength>( &serial[HashSerialHStateIndex], &hstate );
        ReadHashBytes<HashLength>( &serial[HashSerialCarryIndex],  &carry );
      }
      NAN_INLINE void Serialize(uint8_t *serial)
      {
        WriteHashBytes<HashLength>( &hstate, &serial[HashSerialHStateIndex] );
        WriteHashBytes<HashLength>( &carry,  &serial[HashSerialCarryIndex] );
      }
      NAN_INLINE void Update(void *data, int32_t length)
      {
        PMurHash32_Process( &hstate, &carry, data, static_cast<int>(length) );
      }
      NAN_INLINE void Digest(HashValueType hash[HashLength], uint32_t total)
      {
        *hash = PMurHash32_Result( hstate, carry, total );
      }
    private:
      HashValueType hstate, carry;
  };

  template<typename HashValueType, int32_t HashLength>
  class IncrementalMurmurHash128 {
    public:
      NAN_INLINE IncrementalMurmurHash128(const uint32_t seed = 0) : carry() {
        HashValueType *p = hstate + HashLength;
        do {
          *--p = seed;
        } while (p > hstate);
      }
      NAN_INLINE IncrementalMurmurHash128(const uint8_t *serial)
      {
        ReadHashBytes<HashLength>(&serial[HashSerialHStateIndex], hstate);
        ReadHashBytes<HashLength>(&serial[HashSerialCarryIndex],  carry);
      }
      NAN_INLINE void Serialize(uint8_t *serial)
      {
        WriteHashBytes<HashLength>(hstate, &serial[HashSerialHStateIndex]);
        WriteHashBytes<HashLength>(carry,  &serial[HashSerialCarryIndex]);
      }
      NAN_INLINE void Update(void *data, int32_t length)
      {
        PMurHash128_Process(hstate, carry, data, static_cast<int>(length));
      }
      NAN_INLINE void Digest(HashValueType hash[HashLength], uint32_t total)
      {
        PMurHash128_Result(hstate, carry, total, hash);
      }
    private:
      HashValueType hstate[HashLength], carry[HashLength];
  };

}

#endif