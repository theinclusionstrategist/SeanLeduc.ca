/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sets the base routing path for all portal pages
  basePath: '/agentportal',

  async redirects() {
    return [
      {
        source: '/',
        destination: '/agentportal/login',
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
