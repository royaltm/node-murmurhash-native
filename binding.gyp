{
  'targets': [
    {
      'target_name': 'murmurhash',
      'sources': [
        'src/murmurhash/MurmurHash2.cpp',
        'src/murmurhash/MurmurHash3.cpp',
        'src/nodemurmurhash.cc'
      ],
      'include_dirs': [
        "<!(node -e \"require('nan')\")",
        'src/murmurhash',
        'src'
      ],
      'defines': [
        # 'NODE_MURMURHASH_TEST_BYTESWAP=1',
        # 'NODE_MURMURHASH_TEST_ALIGNED=1',
        'NODE_MURMURHASH_KEY_BUFFER_SIZE=1024'
      ],
      'conditions': [
        ['target_arch!="x64"', {
          'defines': [
            'NODE_MURMURHASH_DEFAULT_32BIT',
          ]
        }],
        ['OS=="win"', {
          'msvs_settings': {
            'VCCLCompilerTool': {
              'ExceptionHandling': 1,
              'AdditionalOptions': [
                '/EHsc' # ExceptionHandling=1 is not enough
              ]
            }
          }
        }]
      ]
    },
    {
      'target_name': 'murmurhashincremental',
      'sources': [
        'src/murmurhash/PMurHash.c',
        'src/murmurhash/PMurHash128.cpp',
        'src/incremental/hasher.cc'
      ],
      'include_dirs': [
        "<!(node -e \"require('nan')\")",
        'src/murmurhash',
        'src/incremental',
        'src'
      ],
      'defines': [
        # 'NODE_MURMURHASH_TEST_BYTESWAP=1',
        # 'NODE_MURMURHASH_TEST_ALIGNED=1',
        'NODE_MURMURHASH_KEY_BUFFER_SIZE=1024'
      ],
      'conditions': [
        ['target_arch!="x64"', {
          'defines': [
            'NODE_MURMURHASH_DEFAULT_32BIT',
          ]
        }],
        ['OS=="win"', {
          'msvs_settings': {
            'VCCLCompilerTool': {
              'ExceptionHandling': 1,
              'AdditionalOptions': [
                '/EHsc' # ExceptionHandling=1 is not enough
              ]
            }
          }
        }]
      ]
    }
  ]
}
