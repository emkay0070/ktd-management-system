import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echoConfig = {
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
};

if (import.meta.env.VITE_PUSHER_APP_KEY) {
    window.Echo = new Echo(echoConfig);
} else {
    console.error('Echo Error: VITE_PUSHER_APP_KEY is missing from the environment.');
    console.log('Available Vite Env:', import.meta.env);
}

export default window.Echo;
