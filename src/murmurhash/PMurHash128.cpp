/*-----------------------------------------------------------------------------
 * MurmurHash3 was written by Austin Appleby, and is placed in the public
 * domain.
 *
 * This is a c++ implementation of MurmurHash3_128 with support for progressive
 * processing based on PMurHash implementation written by Shane Day.
 */

/*-----------------------------------------------------------------------------
 
If you want to understand the MurmurHash algorithm you would be much better
off reading the original source. Just point your browser at:
http://code.google.com/p/smhasher/source/browse/trunk/MurmurHash3.cpp


What this version provides?

1. Progressive data feeding. Useful when the entire payload to be hashed
does not fit in memory or when the data is streamed through the application.
Also useful when hashing a number of strings with a common prefix. A partial
hash of a prefix string can be generated and reused for each suffix string.

How does it work?

We can only process entire 128 bit chunks of input, except for the very end
that may be shorter. So along with the partial hash we need to give back to
the caller a carry containing up to 15 bytes that we were unable to process.
This carry also needs to record the number of bytes the carry holds. I use
the low 4 bits as a count (0..15) and the carry bytes are shifted into the
high byte in stream order.

To handle endianess I simply use a macro that reads a uint32_t and define
that macro to be a direct read on little endian machines, a read and swap
on big endian machines.

-----------------------------------------------------------------------------*/


#include "PMurHash128.h"

/* MSVC warnings we choose to ignore */
#if defined(_MSC_VER)
  #pragma warning(disable: 4127) /* conditional expression is constant */
#endif

/*-----------------------------------------------------------------------------
 * Endianess, misalignment capabilities and util macros
 *
 * The following 5 macros are defined in this section. The other macros defined
 * are only needed to help derive these 5.
 *
 * READ_UINT64(x,i) Read a little endian unsigned 64-bit int at index
 * UNALIGNED_SAFE   Defined if READ_UINT64 works on non-word boundaries
 * ROTL64(x,r)      Rotate x left by r bits
 * BIG_CONSTANT
 * FORCE_INLINE
 */

/* Convention is to define __BYTE_ORDER == to one of these values */

/* I386 or AMD64 */
#if defined(_M_I86) || defined(_M_IX86) || defined(_X86_) || defined(__i386__) || defined(__i386) || defined(i386) \
 || defined(_M_X64) || defined(__x86_64__) || defined(__x86_64) || defined(__amd64__) || defined(__amd64)
  #define UNALIGNED_SAFE
#endif

/* Find best way to ROTL64 */
#if defined(_MSC_VER)
  #define FORCE_INLINE  __forceinline
  #include <stdlib.h>  /* Microsoft put _rotl declaration in here */
  #define ROTL64(x,y)  _rotl64(x,y)
  #define BIG_CONSTANT(x) (x)
#else
  #define FORCE_INLINE inline __attribute__((always_inline))
  /* gcc recognises this code and generates a rotate instruction for CPUs with one */
  #define ROTL64(x,r)  (((uint64_t)x << r) | ((uint64_t)x >> (64 - r)))
  #define BIG_CONSTANT(x) (x##LLU)
#endif

#include "endianness.h"

#define READ_UINT64(ptr,i) getblock64((uint64_t *)ptr,i)
//-----------------------------------------------------------------------------
// Finalization mix - force all bits of a hash block to avalanche

FORCE_INLINE uint32_t fmix32 ( uint32_t h )
{
  h ^= h >> 16;
  h *= 0x85ebca6b;
  h ^= h >> 13;
  h *= 0xc2b2ae35;
  h ^= h >> 16;

  return h;
}

//----------

FORCE_INLINE uint64_t fmix64 ( uint64_t k )
{
  k ^= k >> 33;
  k *= BIG_CONSTANT(0xff51afd7ed558ccd);
  k ^= k >> 33;
  k *= BIG_CONSTANT(0xc4ceb9fe1a85ec53);
  k ^= k >> 33;

  return k;
}

/*-----------------------------------------------------------------------------
 * Core murmurhash algorithm macros */

#define C1  BIG_CONSTANT(0x87c37b91114253d5);
#define C2  BIG_CONSTANT(0x4cf5ad432745937f);

/* This is the main processing body of the algorithm. It operates
 * on each full 128-bits of input. */
FORCE_INLINE void doblock128(uint64_t &h1, uint64_t &h2, uint64_t &k1, uint64_t &k2)
{
  k1 *= C1; k1  = ROTL64(k1,31); k1 *= C2; h1 ^= k1;
 
  h1 = ROTL64(h1,27); h1 += h2; h1 = h1*5+0x52dce729;
 
  k2 *= C2; k2  = ROTL64(k2,33); k2 *= C1; h2 ^= k2;
 
  h2 = ROTL64(h2,31); h2 += h1; h2 = h2*5+0x38495ab5;
}

/* Append unaligned bytes to carry, forcing hash churn if we have 16 bytes */
/* cnt=bytes to process, h1,h2=name of h1,h2 var, k1,k2=carry, n=bytes in carry, ptr/len=payload */
FORCE_INLINE void dobytes128(int cnt, uint64_t &h1, uint64_t &h2, uint64_t &k1, uint64_t &k2,
                             int &n, const uint8_t *&ptr, int &len)
{
  while(cnt-- > 0) {
    if (n < 8) {
      k1 = k1>>8 | (uint64_t)*ptr++<<56;
      n++; len--;
    } else
      do {
        k2 = k2>>8 | (uint64_t)*ptr++<<56;
        n++; len--;
        if(n==16) {
            doblock128(h1, h2, k1, k2);
            n = 0;
            break;
        }
      } while(cnt--);
  }
}

/*---------------------------------------------------------------------------*/

/* Main hashing function. Initialise carry[2] to {0,0} and h[2] to an initial {seed,seed}
 * if wanted. Both ph and pcarry are required arguments. */
void PMurHash128x64_Process(uint64_t *ph, uint64_t *pcarry, const void *key, int len)
{
  uint64_t h1 = ph[0];
  uint64_t h2 = ph[1];
  
  uint64_t k1 = pcarry[0];
  uint64_t k2 = pcarry[1];

  const uint8_t *ptr = (uint8_t*)key;
  const uint8_t *end;

  /* Extract carry count from low 4 bits of c value */
  int n = k2 & 15;

#if defined(UNALIGNED_SAFE) && NODE_MURMURHASH_TEST_ALIGNED != 1
  /* This CPU handles unaligned word access */
#pragma message ( "UNALIGNED_SAFE" )
  /* Consume any carry bytes */
  int i = (16-n) & 15;
  if(i && i <= len) {
    dobytes128(i, h1, h2, k1, k2, n, ptr, len);
  }

  /* Process 128-bit chunks */
  end = ptr + (len & ~15);
  for( ; ptr < end ; ptr+=16) {
    k1 = READ_UINT64(ptr, 0);
    k2 = READ_UINT64(ptr, 1);
    doblock128(h1, h2, k1, k2);
  }

#else /*UNALIGNED_SAFE*/
  /* This CPU does not handle unaligned word access */
#pragma message ( "ALIGNED" )
  /* Consume enough so that the next data byte is word aligned */
  int i = -(intptr_t)(void *)ptr & 7;
  if(i && i <= len) {
    dobytes128(i, h1, h2, k1, k2, n, ptr, len);
  }
  /* We're now aligned. Process in aligned blocks. Specialise for each possible carry count */
  end = ptr + (len & ~15);

  switch(n) { /* how many bytes in c */
  case 0: /*
    k1=[--------] k2=[--------] w=[76543210 fedcba98] b=[76543210 fedcba98] */
    for( ; ptr < end ; ptr+=16) {
      k1 = READ_UINT64(ptr, 0);
      k2 = READ_UINT64(ptr, 1);
      doblock128(h1, h2, k1, k2);
    }
    break;
  case 1: case 2: case 3: case 4: case 5: case 6: case 7: /*
    k1=[10------] k2=[--------] w=[98765432 hgfedcba] b=[76543210 fedcba98] k1'=[hg------] */
    {
      int lshift = n*8, rshift = 64-lshift;
      for( ; ptr < end ; ptr+=16) {
        uint64_t c = k1>>rshift;
        k2 = READ_UINT64(ptr, 0);
        c |= k2<<lshift;
        k1 = READ_UINT64(ptr, 1);
        k2 = k2>>rshift | k1<<lshift;
        doblock128(h1, h2, c, k2);
      }
    }
    break;
  case 8: /*
  k1=[76543210] k2=[--------] w=[fedcba98 nmlkjihg] b=[76543210 fedcba98] k1`=[nmlkjihg] */
    for( ; ptr < end ; ptr+=16) {
      k2 = READ_UINT64(ptr, 0);
      doblock128(h1, h2, k1, k2);
      k1 = READ_UINT64(ptr, 1);
    }
    break;
  default: /*
  k1=[76543210] k2=[98------] w=[hgfedcba ponmlkji] b=[76543210 fedcba98] k1`=[nmlkjihg] k2`=[po------] */
    {
      int lshift = n*8-64, rshift = 64-lshift;
      for( ; ptr < end ; ptr+=16) {
        uint64_t c = k2 >> rshift;
        k2 = READ_UINT64(ptr, 0);
        c |= k2 << lshift;
        doblock128(h1, h2, k1, c);
        k1 = k2 >> rshift;
        k2 = READ_UINT64(ptr, 1);
        k1 |= k2 << lshift;
      }
    }
  }
#endif /*UNALIGNED_SAFE*/

  /* Advance over whole 128-bit chunks, possibly leaving 1..15 bytes */
  len -= len & ~15;

  /* Append any remaining bytes into carry */
  dobytes128(len, h1, h2, k1, k2, n, ptr, len);
 
  /* Copy out new running hash and carry */
  ph[0] = h1;
  ph[1] = h2;
  pcarry[0] = k1;
  pcarry[1] = (k2 & ~0xff) | n;
} 

/*---------------------------------------------------------------------------*/

/* Finalize a hash. To match the original Murmur3_128x64 the total_length must be provided */
void PMurHash128x64_Result(const uint64_t *ph, const uint64_t *pcarry, uint32_t total_length, void *out)
{
  uint64_t h1 = ph[0];
  uint64_t h2 = ph[1];

  uint64_t k1;
  uint64_t k2 = pcarry[1];

  int n = k2 & 15;
  if (n) {
    k1 = pcarry[0];
    if (n > 8) {
      k2 >>= (16-n)*8;
      k2 *= C2; k2  = ROTL64(k2,33); k2 *= C1; h2 ^= k2;
    } else {
      k1 >>= (8-n)*8;
    }
    k1 *= C1; k1  = ROTL64(k1,31); k1 *= C2; h1 ^= k1;
  }

  //----------
  // finalization

  h1 ^= total_length; h2 ^= total_length;

  h1 += h2;
  h2 += h1;

  h1 = fmix64(h1);
  h2 = fmix64(h2);

  h1 += h2;
  h2 += h1;

  ((uint64_t*)out)[0] = h1;
  ((uint64_t*)out)[1] = h2;
}
