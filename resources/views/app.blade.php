<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts: Inter loaded from SCSS via system-ui fallback (offline-safe) -->

        <!-- Scripts -->
        <script>
            window.VITE_PUSHER_APP_KEY = "{{ env('VITE_PUSHER_APP_KEY') }}";
            window.VITE_PUSHER_APP_CLUSTER = "{{ env('VITE_PUSHER_APP_CLUSTER', 'mt1') }}";
        </script>
        @routes
        @if (!app()->environment('testing'))
            @viteReactRefresh
            @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @endif
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
