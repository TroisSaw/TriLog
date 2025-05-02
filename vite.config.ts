import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        tailwindcss()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'), // 确保 @ 指向 src 目录
        },
    },
    // 防止 Vite 清除 Rust 显示的错误
    clearScreen: false,
    server: {
        strictPort: true,  // 如果端口被占用，直接报错
        host: false,
        port: 5173,
    },
    // 添加有关当前构建目标的额外前缀，使这些 CLI 设置的 Tauri 环境变量可以在客户端代码中访问
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
    build: {
        // Tauri 在 Windows 上使用 Chromium，在 macOS 和 Linux 上使用 WebKit
        target:
            process.env.TAURI_ENV_PLATFORM == 'windows'
                ? 'chrome105'
                : 'safari13',
        // 在 debug 构建中不使用 minify
        minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
        // 在 debug 构建中生成 sourcemap
        sourcemap: !!process.env.TAURI_ENV_DEBUG,
    },
    define: {
        __VUE_OPTIONS_API__: false, //禁用选项式api减少打包后体积
    }
})
