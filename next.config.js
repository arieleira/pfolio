/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',                 // buat static export
  trailingSlash: true,             // supaya URL cocok dengan folder GitHub Pages
  images: {
    unoptimized: true              // kalau pakai <Image />, biar gak error
  }
};

module.exports = nextConfig;
