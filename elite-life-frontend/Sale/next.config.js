const apiBaseURL = process.env.ApiUrl;

module.exports = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${apiBaseURL}/api/:path*`,
            },
            {
                source: '/image/:path*',
                destination: `${apiBaseURL}/:path*`,
                basePath: false,
            },
            {
                source: '/file/:path*',
                destination: `${apiBaseURL}/:path*`,
                basePath: false,
            },
            {
                source: '/word/:path*',
                destination: `${apiBaseURL}/:path*`,
                basePath: false,
            },
        ];
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};