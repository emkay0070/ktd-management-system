<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('communication.channel.{channelId}', function ($user, $channelId) {
    $participant = \App\Models\CommunicationParticipant::where('channel_id', $channelId)
        ->where('user_id', $user->id)
        ->first();

    if (!$participant) return false;

    return [
        'id' => $user->id,
        'name' => $user->name,
        'role' => $participant->role,
    ];
});
