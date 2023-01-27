export const abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8'
      }
    ],
    name: 'Initialized',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'Paused',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32'
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32'
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32'
      }
    ],
    name: 'RoleAdminChanged',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      }
    ],
    name: 'RoleGranted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      }
    ],
    name: 'RoleRevoked',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'Unpaused',
    type: 'event'
  },
  {
    inputs: [],
    name: 'CREATOR',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'GOVERNOR_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'PAUSER_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'VERIFIER',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'profileId',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'missionId',
            type: 'uint256'
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          }
        ],
        internalType: 'struct DataTypes.AbortWithSigData',
        name: 'vars',
        type: 'tuple'
      }
    ],
    name: 'abortWithSig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256[]',
            name: 'profileIds',
            type: 'uint256[]'
          },
          {
            internalType: 'string',
            name: 'challenges',
            type: 'string'
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          }
        ],
        internalType: 'struct DataTypes.BatchVerifyWithSigData',
        name: 'vars',
        type: 'tuple'
      }
    ],
    name: 'batchVerifyWithSig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256[]',
            name: 'profileIds',
            type: 'uint256[]'
          },
          {
            internalType: 'string',
            name: 'challenges',
            type: 'string'
          }
        ],
        internalType: 'struct DataTypes.CanBatchVerifyData',
        name: 'vars',
        type: 'tuple'
      }
    ],
    name: 'canBatchVerify',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'claimer',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'handle',
        type: 'string'
      },
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]'
      }
    ],
    name: 'canClaim',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'wallet',
        type: 'address'
      }
    ],
    name: 'claimed',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'profileId',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'missionId',
            type: 'uint256'
          },
          {
            internalType: 'string',
            name: 'challenge',
            type: 'string'
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          }
        ],
        internalType: 'struct DataTypes.CompleteWithSigData',
        name: 'vars',
        type: 'tuple'
      }
    ],
    name: 'completeWithSig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'handle',
        type: 'string'
      },
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]'
      }
    ],
    name: 'createProfile',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'profileId',
            type: 'uint256'
          },
          {
            internalType: 'string',
            name: 'challenge',
            type: 'string'
          },
          {
            internalType: 'uint256',
            name: 'reason',
            type: 'uint256'
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          }
        ],
        internalType: 'struct DataTypes.FailWithSigData',
        name: 'vars',
        type: 'tuple'
      }
    ],
    name: 'failWithSig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'profileId',
        type: 'uint256'
      }
    ],
    name: 'getCountAndIncrement',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'profileId',
        type: 'uint256'
      }
    ],
    name: 'getHandle',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32'
      }
    ],
    name: 'getRoleAdmin',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32'
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32'
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'hasRole',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_governor',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_profileModule',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_missionModule',
        type: 'address'
      }
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'merkleroot',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'challenge',
        type: 'string'
      }
    ],
    name: 'missionByChallenge',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'profileId',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'verifier',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'starttime',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'endtime',
            type: 'uint256'
          },
          {
            internalType: 'bytes32',
            name: 'challengeHash',
            type: 'bytes32'
          },
          {
            internalType: 'enum DataTypes.State',
            name: 'state',
            type: 'uint8'
          },
          {
            internalType: 'address',
            name: 'creator',
            type: 'address'
          }
        ],
        internalType: 'struct DataTypes.MissionStruct',
        name: '',
        type: 'tuple'
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      },
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'profileId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'missionId',
        type: 'uint256'
      }
    ],
    name: 'missionById',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'profileId',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'verifier',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'starttime',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'endtime',
            type: 'uint256'
          },
          {
            internalType: 'bytes32',
            name: 'challengeHash',
            type: 'bytes32'
          },
          {
            internalType: 'enum DataTypes.State',
            name: 'state',
            type: 'uint8'
          },
          {
            internalType: 'address',
            name: 'creator',
            type: 'address'
          }
        ],
        internalType: 'struct DataTypes.MissionStruct',
        name: '',
        type: 'tuple'
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      },
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'profileId',
        type: 'uint256'
      },
      {
        internalType: 'string',
        name: 'slug',
        type: 'string'
      }
    ],
    name: 'missionBySlug',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'profileId',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'verifier',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'starttime',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'endtime',
            type: 'uint256'
          },
          {
            internalType: 'bytes32',
            name: 'challengeHash',
            type: 'bytes32'
          },
          {
            internalType: 'enum DataTypes.State',
            name: 'state',
            type: 'uint8'
          },
          {
            internalType: 'address',
            name: 'creator',
            type: 'address'
          }
        ],
        internalType: 'struct DataTypes.MissionStruct',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'slug',
        type: 'string'
      }
    ],
    name: 'missionIdBySlug',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'missionModule',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'wallet',
        type: 'address'
      }
    ],
    name: 'profileByAddress',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'missionCount',
            type: 'uint256'
          },
          {
            internalType: 'string',
            name: 'handle',
            type: 'string'
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address'
          }
        ],
        internalType: 'struct DataTypes.ProfileStruct',
        name: '',
        type: 'tuple'
      },
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      },
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'handle',
        type: 'string'
      }
    ],
    name: 'profileByHandle',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'missionCount',
            type: 'uint256'
          },
          {
            internalType: 'string',
            name: 'handle',
            type: 'string'
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address'
          }
        ],
        internalType: 'struct DataTypes.ProfileStruct',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'profileId',
        type: 'uint256'
      }
    ],
    name: 'profileById',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'missionCount',
            type: 'uint256'
          },
          {
            internalType: 'string',
            name: 'handle',
            type: 'string'
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address'
          }
        ],
        internalType: 'struct DataTypes.ProfileStruct',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'wallet',
        type: 'address'
      }
    ],
    name: 'profileIdByAddress',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'handle',
        type: 'string'
      }
    ],
    name: 'profileIdByHandle',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'profileIdCounter',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'profileModule',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32'
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32'
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32'
      }
    ],
    name: 'setMerklerootForProfiles',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_missionModule',
        type: 'address'
      }
    ],
    name: 'setMissionModule',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_profileModule',
        type: 'address'
      }
    ],
    name: 'setProfileModule',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'wallet',
        type: 'address'
      }
    ],
    name: 'sigNonces',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'profileId',
            type: 'uint256'
          },
          {
            internalType: 'string',
            name: 'slug',
            type: 'string'
          },
          {
            internalType: 'string',
            name: 'contentURI',
            type: 'string'
          },
          {
            internalType: 'uint256',
            name: 'minutesToExpire',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'creator',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'verifier',
            type: 'address'
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          }
        ],
        internalType: 'struct DataTypes.StartWithSigData',
        name: 'vars',
        type: 'tuple'
      }
    ],
    name: 'startWithSig',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4'
      }
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'profileId',
            type: 'uint256'
          },
          {
            internalType: 'string',
            name: 'challenge',
            type: 'string'
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          }
        ],
        internalType: 'struct DataTypes.VerifyWithSigData',
        name: 'vars',
        type: 'tuple'
      }
    ],
    name: 'verifyWithSig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;
