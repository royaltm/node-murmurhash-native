#if !defined(INCREMENTAL_HASHER_IMPL_HEADER)
#define INCREMENTAL_HASHER_IMPL_HEADER

#include "PMurHash.h"
#include "PMurHash128.h"

namespace MurmurHash {
  template<typename HashValueType, int32_t HashLength>
  class IncrementalMurmurHash3A {
    public:
      NAN_INLINE IncrementalMurmurHash3A(const uint32_t seed = 0)
                                    : hstate((HashValueType) seed), carry(0) {}
      NAN_INLINE IncrementalMurmurHash3A(const uint8_t * const serial)
      {
        ReadHashBytesMSB<HashLength>( &serial[0], &hstate );
        ReadHashBytesMSB<HashLength>( &serial[sizeof(hstate)],  &carry );
      }
      NAN_INLINE void Serialize(uint8_t *serial) const
      {
        WriteHashBytesMSB<HashLength>( &hstate, &serial[0] );
        WriteHashBytesMSB<HashLength>( &carry,  &serial[sizeof(hstate)] );
      }
      NAN_INLINE void Update(const void *data, int32_t length)
      {
        PMurHash32_Process( &hstate, &carry, data, static_cast<int>(length) );
      }
      NAN_INLINE void Digest(HashValueType hash[HashLength], uint32_t total) const
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
          *--p = (HashValueType) seed;
        } while (p > hstate);
      }
      NAN_INLINE IncrementalMurmurHash128(const uint8_t * const serial)
      {
        ReadHashBytesMSB<HashLength>( &serial[0], hstate );
        ReadHashBytesMSB<HashLength>( &serial[sizeof(hstate)], carry );
      }
      NAN_INLINE void Serialize(uint8_t *serial) const
      {
        WriteHashBytesMSB<HashLength>( hstate, &serial[0] );
        WriteHashBytesMSB<HashLength>( carry,  &serial[sizeof(hstate)] );
      }
      NAN_INLINE void Update(const void *data, int32_t length)
      {
        PMurHash128_Process( hstate, carry, data, static_cast<int>(length) );
      }
      NAN_INLINE void Digest(HashValueType hash[HashLength], uint32_t total) const
      {
        PMurHash128_Result( hstate, carry, total, hash );
      }
    private:
      HashValueType hstate[HashLength], carry[HashLength];
  };

}

#endif