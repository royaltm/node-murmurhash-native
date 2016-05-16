/*-----------------------------------------------------------------------------
 * MurmurHash3 was written by Austin Appleby, and is placed in the public
 * domain.
 *
 * This implementation was written by Shane Day, and is also public domain.
 *
 * This is a portable ANSI C implementation of MurmurHash3_x86_32 (Murmur3A)
 * with support for progressive processing.
 */

/* ------------------------------------------------------------------------- */
/* Determine what native type to use for uint32_t */

/* We can't use the name 'uint32_t' here because it will conflict with
 * any version provided by the system headers or application. */

/* First look for special cases */
#if defined(_MSC_VER)
  #define MH_UINT16 unsigned short
  #define MH_UINT32 unsigned long
  #define MH_UINT64 unsigned long long
#endif

/* If the compiler says it's C99 then take its word for it */
#if !defined(MH_UINT64) && ( \
     defined(__STDC_VERSION__) && __STDC_VERSION__ >= 199901L )
  #include <stdint.h>
  #define MH_UINT16 uint16_t
  #define MH_UINT32 uint32_t
  #define MH_UINT64 uint64_t
#endif

/* Otherwise try testing against max value macros from limit.h */
#if !defined(MH_UINT64)
  #include  <limits.h>
  #if   (USHRT_MAX == 0xffffU)
    #define MH_UINT16 unsigned short
  #endif
  #if   (USHRT_MAX == 0xffffffffUL)
    #define MH_UINT32 unsigned short
  #elif (UINT_MAX == 0xffffffffUL)
    #define MH_UINT32 unsigned int
  #elif (ULONG_MAX == 0xffffffffUL)
    #define MH_UINT32 unsigned long
  #endif
  #if   (ULLONG_MAX == 0xffffffffffffffffULL)
    #define MH_UINT64 unsigned long long
  #endif
#endif

#if !defined(MH_UINT16)
  #error Unable to determine type name for unsigned 16-bit int
#endif

#if !defined(MH_UINT32)
  #error Unable to determine type name for unsigned 32-bit int
#endif

#if !defined(MH_UINT64)
  #error Unable to determine type name for unsigned 64-bit int
#endif

/* I'm yet to work on a platform where 'unsigned char' is not 8 bits */
#define MH_UINT8  unsigned char


/* ------------------------------------------------------------------------- */
/* Prototypes */

// #ifdef __cplusplus
// extern "C" {
// #endif

void PMurHash128x64_Process(MH_UINT64 *ph, MH_UINT64 *pcarry, const void *key, int len);
void PMurHash128x64_Result(const MH_UINT64 *ph, const MH_UINT64 *pcarry, MH_UINT32 total_length, void *out);

// #ifdef __cplusplus
// }
// #endif
