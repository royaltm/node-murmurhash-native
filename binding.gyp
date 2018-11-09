{
  'targets': [
    {
      'target_name': 'murmurhash',
      'sources': [
        'src/murmurhash/MurmurHash2.cpp',
        'src/murmurhash/PMurHash.cpp',
        'src/murmurhash/PMurHash128.cpp',
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
              'DisableSpecificWarnings': ['4506', '4996']
            }
          }
        }],
        ['OS!="win"', {
          "cflags": [
            "-Wno-deprecated-declarations",
          ],
          "xcode_settings": {
            "OTHER_CFLAGS": [
              "-Wno-deprecated-declarations",
            ],
          },
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
              'DisableSpecificWarnings': ['4506', '4996']
            }
          }
        }],
        ['OS!="win"', {
          "cflags": [
            "-Wno-deprecated-declarations",
          ],
          "xcode_settings": {
            "OTHER_CFLAGS": [
              "-Wno-deprecated-declarations",
            ],
          },
        }]
      ]
    },
    {
      "target_name": "action_after_build",
      "type": "none",
      "dependencies": [ "murmurhash", "murmurhashincremental" ],
      "copies": [
        {
          "files": [
            "<(PRODUCT_DIR)/murmurhash.node",
            "<(PRODUCT_DIR)/murmurhashincremental.node"
          ],
          "destination": "<(module_path)"
        }
      ]
    }
  ]
}
