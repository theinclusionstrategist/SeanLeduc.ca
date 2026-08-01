/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVE basePath if using a subdomain like agentportal.seanleduc.ca
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
