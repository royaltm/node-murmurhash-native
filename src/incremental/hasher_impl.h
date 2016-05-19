#if !defined(INCREMENTAL_HASHER_IMPL_HEADER)
#define INCREMENTAL_HASHER_IMPL_HEADER

#include "PMurHash.h"
#include "PMurHash128.h"

#define BASE64_ENCODED_SIZE(size) ((size + 2 - ((size + 2) % 3)) / 3 * 4)

#define HashSerialCkSize 3
#define HashSerialCkMask static_cast<int32_t>((1ULL << (HashSerialCkSize * 8)) - 1)

#define HashSerialHStateIndex 0
#define HashSerialCarryIndex (HashSerialHStateIndex + HashSize)
#define HashSerialTotalIndex (HashSerialCarryIndex + HashSize)
#define HashSerialCkIndex (HashSerialTotalIndex + static_cast<int32_t>(sizeof(uint32_t)))

#define HashSerialSize (HashSerialCkIndex + HashSerialCkSize)
#define HashSerialStringSize BASE64_ENCODED_SIZE(HashSerialSize)
/*
 Serial data in network byte order
                     0: hstate[MSByte] ... hstate[LSByte]
 HashSerialHStateIndex:  carry[MSByte] ... carry[LSByte]
  HashSerialCarryIndex:  total[MSByte] ... total[LSByte]
     HashSerialCkIndex:  chksum = ((ck[0] ^ chksum >>24)<<16) | ck[1]<<8 | ck[2]
*/
#define HashSerialCkSeed 0xdeadbaca

#define HashSerialType (static_cast<uint8_t>(0x0F ^ HashLength ^ sizeof(HashValueType)) << 4)
#define HashSerialTypeMask static_cast<uint8_t>(0xF0 | (0x10 - HashSize))
#define HashSerialTypeIndex (HashSerialTotalIndex - 1)
/*
                         HashSerialType           HashSerialTypeMask
        MurmurHash3A     0b101000nn 15 ^ 1 ^ 4 = 0xA0  0xF0 | 0x10 - 4  = 0xFC
        MurmurHash128x64 0b0101nnnn 15 ^ 2 ^ 8 = 0x50  0xF0 | 0x10 - 16 = 0xF0
        MurmurHash128x86 0b1111nnnn 15 ^ 4 ^ 4 = 0xF0  0xF0 | 0x10 - 16 = 0xF0
        MurmurHash64x64  0b01100nnn 15 ^ 1 ^ 8 = 0x60  0xF0 | 0x10 - 8  = 0xF8
        MurmurHash64x86  0b10010nnn 15 ^ 2 ^ 4 = 0x90  0xF0 | 0x10 - 8  = 0xF8
*/

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