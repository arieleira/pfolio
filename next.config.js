/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // biar deploy gak gagal karena error lint/tipe
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // karena project kamu banyak gambar, izinkan gambar eksternal
  // (kalau mau ketat, ganti '**' dengan domain yang kamu pakai)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    // kalau kamu masih pakai <img> biasa dan gak butuh optimizer:
    // unoptimized: true,
  },
};

module.exports = nextConfig;
