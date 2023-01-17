module.exports = {
  experimental: {
    appDir: true
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'madseed.infura-ipfs.io',
        port: '',
        pathname: '/ipfs/**'
      }
    ],
    domains: [
      'ipfs.infura.io',
      'avatar.tobi.sh',
      'ipfs.io',
      'infura-ipfs.io',
      'madseed.infura-ipfs.io'
    ]
  },
  env: {
    GIT_COMMIT_REF: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
    GIT_COMMIT_SHA: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
  }
};
