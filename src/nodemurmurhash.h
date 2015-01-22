#if !defined(NODEMURMURHASH_HEADER)
#define NODEMURMURHASH_HEADER

#include <node.h>
#include <node_buffer.h>
#include <v8.h>
#include <nan.h>
#include <string.h>

#include "nanpolyfill.h"

#ifdef _MSC_VER
#  define strncasecmp _strnicmp
#  define strcasecmp _stricmp
#endif

#endif