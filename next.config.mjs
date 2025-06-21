/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configuración para aplicación de escritorio
    //output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    // Deshabilitar optimizaciones que no funcionan en Electron
    swcMinify: false,
    // Configuración para archivos estáticos
    assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
    // Configuración para rutas
    basePath: '',
    // Configuración para exportación estática
    distDir: 'out',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
}

export default nextConfig

