import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
        plugins: [
            laravel({
                input: ['resources/css/app.scss', 'resources/js/app.jsx'],
                refresh: true,
            }),
            react(),
        ],
        define: {
            'process.env.VITE_PUSHER_APP_KEY': JSON.stringify(env.VITE_PUSHER_APP_KEY),
            'process.env.VITE_PUSHER_APP_CLUSTER': JSON.stringify(env.VITE_PUSHER_APP_CLUSTER),
        },
        css: {
            preprocessorOptions: {
                scss: {
                    silenceDeprecations: ['import'],
                },
            },
        },
        server: {
            watch: {
                ignored: ['**/storage/framework/views/**'],
            },
        },
    };
});
