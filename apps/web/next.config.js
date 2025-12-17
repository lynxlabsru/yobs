/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: process.env.API_URL
                    ? `${process.env.API_URL}/api/:path*`
                    : 'https://yobs.onrender.com/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
