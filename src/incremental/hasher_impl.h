#if !defined(INCREMENTAL_HASHER_IMPL_HEADER)
#define INCREMENTAL_HASHER_IMPL_HEADER

#include "PMurHash.h"
#include "PMurHash128.h"

namespace MurmurHash {
  class IncrementalMurmurHash3A {
    public:
      NAN_INLINE IncrementalMurmurHash3A(uint32_t seed) : h(seed), carry(0) {}
      NAN_INLINE void Update(void *data, int32_t length)
      {
        PMurHash32_Process((uint32_t *)&h, (uint32_t *)&carry, data, (int) length);
      }
      NAN_INLINE void Digest(uint32_t *hash, int32_t total)
      {
        *hash = PMurHash32_Result((uint32_t) h, (uint32_t) carry, (uint32_t) total);
      }
    private:
      uint32_t h, carry;
  };

  class IncrementalMurmurHash128x64 {
    public:
      NAN_INLINE IncrementalMurmurHash128x64(uint32_t seed) : carry() {
        /* could h{seed, seed} but clang with node 0.x bails */
        h[0] = seed;
        h[1] = seed;
      }
      NAN_INLINE void Update(void *data, int32_t length)
      {
        PMurHash128x64_Process(h, carry, data, (int) length);
      }
      NAN_INLINE void Digest(uint64_t *hash, int32_t total)
      {
        PMurHash128x64_Result(h, carry, (uint32_t) total, hash);
      }
    private:
      uint64_t h[2], carry[2];
  };

  class IncrementalMurmurHash128x86 {
    public:
      NAN_INLINE IncrementalMurmurHash128x86(uint32_t seed) : carry() {
        h[0] = seed;
        h[1] = seed;
        h[2] = seed;
        h[3] = seed;
      }
      NAN_INLINE void Update(void *data, int32_t length)
      {
        PMurHash128x86_Process(h, carry, data, (int) length);
      }
      NAN_INLINE void Digest(uint32_t *hash, int32_t total)
      {
        PMurHash128x86_Result(h, carry, (uint32_t) total, hash);
      }
    private:
      uint32_t h[4], carry[4];
  };
}

#endif