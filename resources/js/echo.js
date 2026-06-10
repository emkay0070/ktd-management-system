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
    console.warn('Echo could not be initialized: VITE_PUSHER_APP_KEY is missing.');
}

export default window.Echo;
