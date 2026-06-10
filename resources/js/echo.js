import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const getEnv = (key) => {
    return window[key] || import.meta.env[key] || (typeof process !== 'undefined' && process.env ? process.env[key] : undefined);
};

const PUSHER_KEY = getEnv('VITE_PUSHER_APP_KEY');
const PUSHER_CLUSTER = getEnv('VITE_PUSHER_APP_CLUSTER');

const echoConfig = {
    broadcaster: 'pusher',
    key: PUSHER_KEY,
    cluster: PUSHER_CLUSTER,
    forceTLS: true,
};

if (PUSHER_KEY) {
    window.Echo = new Echo(echoConfig);
} else {
    console.error('Echo Error: VITE_PUSHER_APP_KEY is missing from the environment.');
    console.log('Vite meta.env:', import.meta.env);
    if (typeof process !== 'undefined') console.log('Process env:', process.env);
}

export default window.Echo;
