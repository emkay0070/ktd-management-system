import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const getEnv = (key) => {
    return window[key] || import.meta.env[key] || (typeof process !== 'undefined' && process.env ? process.env[key] : undefined);
};

// Check for Reverb first, then fall back to Pusher
const REVERB_APP_KEY = getEnv('VITE_REVERB_APP_KEY');
const REVERB_HOST = getEnv('VITE_REVERB_HOST');
const REVERB_PORT = getEnv('VITE_REVERB_PORT');
const REVERB_SCHEME = getEnv('VITE_REVERB_SCHEME');

const PUSHER_KEY = getEnv('VITE_PUSHER_APP_KEY');
const PUSHER_CLUSTER = getEnv('VITE_PUSHER_APP_CLUSTER');

let echoConfig;

if (REVERB_APP_KEY) {
    // Use Reverb
    echoConfig = {
        broadcaster: 'reverb',
        key: REVERB_APP_KEY,
        wsHost: REVERB_HOST,
        wsPort: REVERB_PORT,
        wssPort: REVERB_PORT,
        forceTLS: REVERB_SCHEME === 'https',
        enabledTransports: ['ws', 'wss'],
    };
} else if (PUSHER_KEY) {
    // Fall back to Pusher
    echoConfig = {
        broadcaster: 'pusher',
        key: PUSHER_KEY,
        cluster: PUSHER_CLUSTER,
        forceTLS: true,
    };
} else {
    console.error('Echo Error: No WebSocket credentials found (VITE_REVERB_APP_KEY or VITE_PUSHER_APP_KEY).');
    console.log('Vite meta.env:', import.meta.env);
    if (typeof process !== 'undefined') console.log('Process env:', process.env);
}

if (echoConfig) {
    window.Echo = new Echo(echoConfig);
    console.log('Echo initialized with', echoConfig.broadcaster);
}

export default window.Echo;
