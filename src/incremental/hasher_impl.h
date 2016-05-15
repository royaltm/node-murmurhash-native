#if !defined(INCREMENTAL_HASHER_IMPL_HEADER)
#define INCREMENTAL_HASHER_IMPL_HEADER

extern "C" {
#  include "PMurHash.h"
}

namespace MurmurHash {
  class IncrementalMurmurHash3A {
    public:
      NAN_INLINE IncrementalMurmurHash3A(uint32_t seed) : h1(seed), carry(0) {}
      NAN_INLINE void Update(void *data, int32_t length)
      {
        PMurHash32_Process((MH_UINT32 *)&h1, (MH_UINT32 *)&carry, data, (int) length);
      }
      NAN_INLINE void Digest(uint32_t *hash, int32_t total)
      {
        *hash = PMurHash32_Result((MH_UINT32) h1, (MH_UINT32) carry, (MH_UINT32) total);
      }
    private:
      uint32_t h1, carry;
  };
}

#endif