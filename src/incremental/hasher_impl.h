#if !defined(INCREMENTAL_HASHER_IMPL_HEADER)
#define INCREMENTAL_HASHER_IMPL_HEADER

extern "C" {
#  include "PMurHash.h"
}
#  include "PMurHash128.h"

namespace MurmurHash {
  class IncrementalMurmurHash3A {
    public:
      NAN_INLINE IncrementalMurmurHash3A(uint32_t seed) : h(seed), carry(0) {}
      NAN_INLINE void Update(void *data, int32_t length)
      {
        PMurHash32_Process((MH_UINT32 *)&h, (MH_UINT32 *)&carry, data, (int) length);
      }
      NAN_INLINE void Digest(uint32_t *hash, int32_t total)
      {
        *hash = PMurHash32_Result((MH_UINT32) h, (MH_UINT32) carry, (MH_UINT32) total);
      }
    private:
      uint32_t h, carry;
  };

  class IncrementalMurmurHash128x64 {
    public:
      NAN_INLINE IncrementalMurmurHash128x64(uint32_t seed) : h{seed, seed}, carry() {}
      NAN_INLINE void Update(void *data, int32_t length)
      {
        PMurHash128x64_Process((MH_UINT64 *)h, (MH_UINT64 *)carry, data, (int) length);
      }
      NAN_INLINE void Digest(uint64_t *hash, int32_t total)
      {
        PMurHash128x64_Result((MH_UINT64 *)h, (MH_UINT64 *)carry, (MH_UINT32) total, (void *)hash);
      }
    private:
      uint64_t h[2], carry[2];
  };
}

#endif