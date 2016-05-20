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
              'AdditionalOptions': ['/EHsc'], # pre 1.0 node compiler complaining
              'DisableSpecificWarnings': ['4506']
            }
          }
        }]
      ]
    },
    {
      'target_name': 'murmurhashincremental',
      'sources': [
        'src/murmurhash/PMurHash.cpp',
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
              'AdditionalOptions': ['/EHsc'], # pre 1.0 node compiler complaining
              'DisableSpecificWarnings': ['4506']
            }
          }
        }]
      ]
    }
  ]
}
