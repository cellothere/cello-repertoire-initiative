const withTM = require('next-transpile-modules')([
  '@mui/material', 
  '@mui/system', 
  '@mui/styled-engine',
  '@mui/private-theming'
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  reactStrictMode: true,
};

module.exports = withTM(nextConfig);
