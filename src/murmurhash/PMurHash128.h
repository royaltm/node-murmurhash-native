/*-----------------------------------------------------------------------------
 * MurmurHash3 was written by Austin Appleby, and is placed in the public
 * domain.
 *
 * This is a c++ implementation of MurmurHash3_128 with support for progressive
 * processing based on PMurHash implementation written by Shane Day.
 */

/* ------------------------------------------------------------------------- */

// Microsoft Visual Studio

#if defined(_MSC_VER) && (_MSC_VER < 1600)

typedef unsigned char uint8_t;
typedef unsigned int uint32_t;
typedef unsigned __int64 uint64_t;

// Other compilers

#else // defined(_MSC_VER)

#include <stdint.h>

#endif // !defined(_MSC_VER)

/* ------------------------------------------------------------------------- */
/* Prototypes */

// #ifdef __cplusplus
// extern "C" {
// #endif

void PMurHash128x64_Process(uint64_t *ph, uint64_t *pcarry, const void *key, int len);
void PMurHash128x64_Result(const uint64_t *ph, const uint64_t *pcarry, uint32_t total_length, void *out);

// #ifdef __cplusplus
// }
// #endif
