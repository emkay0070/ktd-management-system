<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\CommunicationAttachment;
use App\Models\CommunicationChannel;
use App\Models\CommunicationMessage;
use App\Models\CommunicationParticipant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CommunicationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $channels = CommunicationChannel::whereHas('participants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with(['lastMessage.sender', 'participants.user'])
        ->withCount(['messages as unread_count' => function ($query) use ($user) {
            $query->where('created_at', '>', function ($subQuery) use ($user) {
                $subQuery->select('last_read_at')
                    ->from('communication_participants')
                    ->whereColumn('channel_id', 'communication_messages.channel_id')
                    ->where('user_id', $user->id);
            });
        }])
        ->latest('updated_at')
        ->get();

        return Inertia::render('Communication/Index', [
            'channels' => $channels,
        ]);
    }

    public function show(CommunicationChannel $channel, Request $request)
    {
        $user = $request->user();
        
        // Ensure user is participant
        $participant = CommunicationParticipant::where('channel_id', $channel->id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Mark as read
        $participant->update(['last_read_at' => now()]);

        $messages = CommunicationMessage::where('channel_id', $channel->id)
            ->with(['sender', 'attachments', 'reactions.user'])
            ->oldest()
            ->paginate(50);

        return response()->json([
            'messages' => $messages,
            'channel' => $channel->load('participants.user'),
        ]);
    }

    public function store(Request $request, CommunicationChannel $channel)
    {
        $user = $request->user();
        
        // Ensure user is participant
        abort_unless(CommunicationParticipant::where('channel_id', $channel->id)
            ->where('user_id', $user->id)
            ->exists(), 403);

        $validated = $request->validate([
            'content' => 'required_without:attachments|nullable|string',
            'type' => 'required|string|in:text,image,audio,video,document,system',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240', // 10MB limit
        ]);

        return DB::transaction(function () use ($channel, $user, $validated, $request) {
            $message = CommunicationMessage::create([
                'channel_id' => $channel->id,
                'sender_id' => $user->id,
                'content' => $validated['content'] ?? null,
                'type' => $validated['type'],
            ]);

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('communication/attachments/' . $channel->id, 'public');
                    
                    CommunicationAttachment::create([
                        'message_id' => $message->id,
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'file_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
                
                // If only attachments, update type to first attachment type if not specified
                if (!$validated['content'] && $validated['type'] === 'text') {
                    $firstMime = $request->file('attachments')[0]->getMimeType();
                    $message->update(['type' => $this->mapMimeToType($firstMime)]);
                }
            }

            // Update channel timestamp
            $channel->touch();

            // Broadcast
            broadcast(new MessageSent($message))->toOthers();

            return $message->load(['sender', 'attachments', 'reactions']);
        });
    }

    public function startDirectMessage(User $recipient, Request $request)
    {
        $user = $request->user();
        
        if ($user->id === $recipient->id) {
            abort(400, "Cannot message yourself.");
        }

        // Check if DM already exists
        $channel = CommunicationChannel::where('type', 'direct')
            ->whereHas('participants', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->whereHas('participants', function ($q) use ($recipient) {
                $q->where('user_id', $recipient->id);
            })
            ->first();

        if (!$channel) {
            $channel = DB::transaction(function () use ($user, $recipient) {
                $channel = CommunicationChannel::create([
                    'type' => 'direct',
                    'slug' => 'dm-' . Str::uuid(),
                    'created_by' => $user->id,
                ]);

                CommunicationParticipant::create([
                    'channel_id' => $channel->id,
                    'user_id' => $user->id,
                    'role' => 'admin',
                ]);

                CommunicationParticipant::create([
                    'channel_id' => $channel->id,
                    'user_id' => $recipient->id,
                    'role' => 'admin',
                ]);

                return $channel;
            });
        }

        return redirect()->route('communication.index', ['channel' => $channel->slug]);
    }

    public function feed(Request $request)
    {
        $user = $request->user();
        
        // Aggregate messages from public, club, district, and union channels the user is in
        $messages = CommunicationMessage::whereHas('channel', function ($query) use ($user) {
            $query->whereIn('type', ['club', 'district', 'union', 'public'])
                ->whereHas('participants', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
        })
        ->with(['sender', 'attachments', 'reactions.user', 'channel', 'comments.user'])
        ->latest()
        ->paginate(20);

        if ($request->wantsJson()) {
            return response()->json($messages);
        }

        return Inertia::render('Communication/Feed', [
            'posts' => $messages,
        ]);
    }

    public function toggleReaction(Request $request, CommunicationMessage $message)
    {
        $user = $request->user();
        $validated = $request->validate([
            'emoji' => 'required|string',
        ]);

        $existing = \App\Models\CommunicationReaction::where('message_id', $message->id)
            ->where('user_id', $user->id)
            ->where('emoji', $validated['emoji'])
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            \App\Models\CommunicationReaction::create([
                'message_id' => $message->id,
                'user_id' => $user->id,
                'emoji' => $validated['emoji'],
            ]);
        }

        broadcast(new \App\Events\ReactionUpdated($message))->toOthers();

        return response()->json($message->reactions()->with('user:id,name')->get());
    }

    public function storeComment(Request $request, CommunicationMessage $message)
    {
        $user = $request->user();
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment = \App\Models\CommunicationComment::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'content' => $validated['content'],
        ]);

        return response()->json($comment->load('user'));
    }

    protected function mapMimeToType($mime)
    {
        if (Str::startsWith($mime, 'image/')) return 'image';
        if (Str::startsWith($mime, 'audio/')) return 'audio';
        if (Str::startsWith($mime, 'video/')) return 'video';
        return 'document';
    }
}
