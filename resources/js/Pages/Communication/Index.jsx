import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Send, Paperclip, Smile, Image, Mic, FileText,
    MoreVertical, Search, Hash, MessageSquare,
    Users, Info, ChevronLeft, Phone, Video, Plus, X, User
} from 'lucide-react';
import CreateChannelModal from './Partials/CreateChannelModal';
import ManageChannelModal from './Partials/ManageChannelModal';
import axios from 'axios';

export default function Index({ auth, channels = [], initialChannelSlug = null }) {
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        content: '',
        type: 'text',
        attachments: [],
    });

    useEffect(() => {
        if (initialChannelSlug) {
            const channel = channels.find(c => c.slug === initialChannelSlug);
            if (channel) selectChannel(channel);
        }
    }, [initialChannelSlug]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const selectChannel = async (channel) => {
        setShowUserSearch(false);
        if (selectedChannel && window.Echo) {
            window.Echo.leave(`communication.channel.${selectedChannel.id}`);
        }

        setSelectedChannel(channel);
        setLoading(true);
        setTypingUsers([]);
        try {
            const response = await axios.get(route('communication.show', channel.slug));
            setMessages(response.data.messages.data || response.data.messages);

            if (window.Echo) {
                window.Echo.join(`communication.channel.${channel.id}`)
                    .here((users) => {
                        setOnlineUsers(users);
                    })
                    .joining((user) => {
                        setOnlineUsers(prev => [...prev, user]);
                    })
                    .leaving((user) => {
                        setOnlineUsers(prev => prev.filter(u => u.id !== user.id));
                    })
                    .listen('.message.sent', (e) => {
                        if (e.message.sender_id !== auth.user.id) {
                            setMessages(prev => [...prev, e.message]);
                        }
                    })
                    .listen('.reaction.updated', (e) => {
                        setMessages(prev => prev.map(msg =>
                            msg.id === e.messageId ? { ...msg, reactions: e.reactions } : msg
                        ));
                    })
                    .listenForWhisper('typing', (e) => {
                        if (e.id !== auth.user.id && !typingUsers.find(u => u.id === e.id)) {
                            setTypingUsers(prev => [...prev, e]);
                            setTimeout(() => {
                                setTypingUsers(prev => prev.filter(u => u.id !== e.id));
                            }, 3000);
                        }
                    });
            }
        } catch (error) {
            console.error('Failed to load messages', error);
        } finally {
            setLoading(false);
        }
    };

    const startDirectMessage = async (user) => {
        try {
            const response = await axios.post(route('communication.direct.start', user.id));
            if (response.status === 200 || response.status === 302) {
                router.reload();
            }
        } catch (error) {
            console.error('Failed to start direct message', error);
            alert('Failed to start direct message');
        }
    };

    const handleUserSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const response = await axios.get(route('communication.users.search', { q: query }));
            const filtered = response.data.filter(u => u.id !== auth.user.id);
            setSearchResults(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    const toggleReaction = async (messageId, emoji) => {
        try {
            const response = await axios.post(route('communication.messages.reactions.toggle', messageId), { emoji });
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, reactions: response.data } : msg
            ));
        } catch (error) {
            console.error('Failed to toggle reaction', error);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
                setData(prev => ({
                    ...prev,
                    attachments: [...prev.attachments, file],
                    type: 'audio'
                }));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Failed to start recording', error);
            if (error.name === 'NotAllowedError') {
                alert('Microphone permission denied. Please allow microphone access in your browser settings.');
            } else {
                alert(`Failed to start recording: ${error.message}`);
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!data.content && data.attachments.length === 0) return;

        try {
            const formData = new FormData();
            if (data.content) formData.append('content', data.content);
            formData.append('type', data.type);
            data.attachments.forEach((file) => {
                formData.append('attachments[]', file);
            });

            const response = await axios.post(
                route('communication.messages.store', selectedChannel.slug),
                formData
            );

            if (response.data) {
                setMessages(prev => [...prev, response.data]);
            }

            reset();
        } catch (error) {
            console.error('Failed to send message:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
            }
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setData('attachments', [...data.attachments, ...files]);
    };

    const removeAttachment = (index) => {
        setData('attachments', data.attachments.filter((_, i) => i !== index));
    };

    const getChannelName = (channel) => {
        if (channel.type === 'direct') {
            const otherUser = channel.participants?.find(p => p.user_id !== auth.user.id);
            return otherUser ? otherUser.user.name : 'Direct Message';
        }
        return channel.name || `${channel.type.toUpperCase()} Channel`;
    };

    const getLastMessagePreview = (message) => {
        if (!message) return 'No messages yet';
        if (message.content) return message.content;
        if (message.attachments?.length > 0) {
            const firstAttachment = message.attachments[0];
            if (firstAttachment.file_type.startsWith('audio/')) return '🎤 Voice note';
            if (firstAttachment.file_type.startsWith('image/')) return '🖼️ Image';
            if (firstAttachment.file_type.startsWith('video/')) return '🎥 Video';
            return '📎 Attachment';
        }
        return 'No messages yet';
    };

    const getChannelTypeLabel = (type) => {
        const labels = {
            'direct': 'Private Chat',
            'group': 'Group Chat',
            'club': 'Club',
            'district': 'District',
            'union': 'Union',
            'public': 'Public'
        };
        return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Communication Center</h2>}
        >
            <Head title="Communication Center" />

            <div className="communication-container h-[calc(100vh-120px)] flex" data-role-theme="district">
                {/* Sidebar */}
                <div className="communication-sidebar w-80 bg-[#0f0f15] border-r border-white/5 flex flex-col">
                    <div className="communication-sidebar-header p-4 border-b border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-white">Messages</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowUserSearch(!showUserSearch)}
                                    className="btn-icon hover:bg-burgundy-500/20"
                                    title="Start New Chat"
                                >
                                    <User size={20} />
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="btn-icon hover:bg-burgundy-500/20"
                                    title="Create Group Channel"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="communication-search relative">
                            <Search className="icon absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 p-2 text-sm text-white focus:border-burgundy-500"
                            />
                        </div>
                    </div>

                    {showUserSearch && (
                        <div className="p-4 border-b border-white/5">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleUserSearch}
                                placeholder="Search users to message..."
                                className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-white text-sm focus:border-burgundy-500"
                            />
                            {searching && <div className="text-center py-2 text-gray-500 text-xs">Searching...</div>}
                            {searchResults.length > 0 && (
                                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                                    {searchResults.map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => startDirectMessage(user)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-burgundy-600 to-burgundy-900 flex items-center justify-center text-white font-bold text-sm">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="communication-channel-list flex-1 overflow-y-auto p-2">
                        {channels.map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => selectChannel(channel)}
                                className={`channel-item w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${selectedChannel?.id === channel.id ? 'bg-burgundy-500/20 border border-burgundy-500/30' : 'hover:bg-white/5'}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-burgundy-600 to-burgundy-900 flex items-center justify-center text-white font-bold">
                                        {channel.type === 'direct' ? <MessageSquare size={18} /> : <Hash size={18} />}
                                    </div>
                                    {channel.unread_count > 0 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-burgundy-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                            {channel.unread_count}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-white truncate">{getChannelName(channel)}</span>
                                        {channel.lastMessage && (
                                            <span className="text-xs text-gray-500">
                                                {new Date(channel.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">
                                        {getLastMessagePreview(channel.lastMessage)}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="communication-chat-area flex-1 flex flex-col bg-[#16161d]">
                    {selectedChannel ? (
                        <>
                            {/* Chat Header */}
                            <div className="chat-header p-4 border-b border-white/5 flex items-center justify-between bg-[#16161d]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-burgundy-600 to-burgundy-900 flex items-center justify-center text-white font-bold">
                                        {selectedChannel.type === 'direct' ? <MessageSquare size={18} /> : <Hash size={18} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{getChannelName(selectedChannel)}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>{getChannelTypeLabel(selectedChannel.type)}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                {onlineUsers.length} online
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => alert('Voice calls coming soon!')} className="btn-icon hover:bg-white/5">
                                        <Phone size={20} />
                                    </button>
                                    <button onClick={() => alert('Video calls coming soon!')} className="btn-icon hover:bg-white/5">
                                        <Video size={20} />
                                    </button>
                                    <button onClick={() => setShowManageModal(true)} className="btn-icon hover:bg-white/5">
                                        <Info size={20} />
                                    </button>
                                    <button onClick={() => setShowManageModal(true)} className="btn-icon hover:bg-white/5">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="chat-messages flex-1 overflow-y-auto p-6 space-y-4">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-gray-500">Loading messages...</div>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message, idx) => {
                                            const isMe = message.sender_id === auth.user.id;
                                            return (
                                                <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className="flex gap-3 max-w-[70%]">
                                                        {!isMe && (
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-burgundy-600 to-burgundy-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                                {message.sender?.name?.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                                            {!isMe && (
                                                                <div className="text-xs text-gray-400 font-medium ml-1">
                                                                    {message.sender?.name}
                                                                </div>
                                                            )}
                                                            <div className={`p-3 rounded-2xl ${isMe ? 'bg-burgundy-600 text-white rounded-tr-sm' : 'bg-[#252532] text-white rounded-tl-sm'}`}>
                                                                {message.content && (
                                                                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                                                                )}
                                                                {message.attachments?.length > 0 && (
                                                                    <div className="mt-2 space-y-2">
                                                                        {message.attachments.map(file => (
                                                                            <div key={file.id}>
                                                                                {file.file_type.startsWith('image/') ? (
                                                                                    <img
                                                                                        src={file.url}
                                                                                        alt={file.file_name}
                                                                                        className="max-w-full rounded-xl max-h-64 object-cover"
                                                                                    />
                                                                                ) : file.file_type.startsWith('audio/') ? (
                                                                                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
                                                                                        <div className="p-2 bg-white/10 rounded-full">
                                                                                            <Mic size={16} />
                                                                                        </div>
                                                                                        <audio controls src={file.url} className="h-10" />
                                                                                    </div>
                                                                                ) : (
                                                                                    <a
                                                                                        href={file.url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="flex items-center gap-3 p-3 bg-black/20 rounded-xl hover:bg-black/30 transition-colors"
                                                                                    >
                                                                                        <FileText size={20} />
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <div className="text-sm font-medium truncate">{file.file_name}</div>
                                                                                            <div className="text-xs text-gray-400">
                                                                                                {(file.file_size / 1024 / 1024).toFixed(2)} MB
                                                                                            </div>
                                                                                        </div>
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {message.reactions?.length > 0 && (
                                                                    <div className="flex gap-1">
                                                                        {message.reactions.reduce((acc, curr) => {
                                                                            const existing = acc.find(r => r.emoji === curr.emoji);
                                                                            if (existing) {
                                                                                existing.count++;
                                                                            } else {
                                                                                acc.push({ emoji: curr.emoji, count: 1, isMe: curr.user_id === auth.user.id });
                                                                            }
                                                                            return acc;
                                                                        }, []).map(reaction => (
                                                                            <button
                                                                                key={reaction.emoji}
                                                                                onClick={() => toggleReaction(message.id, reaction.emoji)}
                                                                                className={`px-2 py-0.5 rounded-full text-xs ${reaction.isMe ? 'bg-burgundy-500/30 text-burgundy-400' : 'bg-white/5 text-gray-300'}`}
                                                                            >
                                                                                {reaction.emoji} {reaction.count}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <span className="text-[10px] text-gray-500">
                                                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {typingUsers.length > 0 && (
                                            <div className="text-xs text-gray-500 italic">
                                                {typingUsers.length === 1
                                                    ? `${typingUsers[0].name} is typing...`
                                                    : `${typingUsers.length} people are typing...`
                                                }
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="chat-input-area p-4 border-t border-white/5 bg-[#16161d]">
                                <form onSubmit={handleSendMessage} className="space-y-3">
                                    {data.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {data.attachments.map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-black/20 rounded-xl p-2 pl-3">
                                                    <FileText size={14} />
                                                    <span className="text-sm text-gray-300 truncate max-w-[150px]">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(idx)}
                                                        className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-end gap-3">
                                        <div className="flex-1 bg-[#252532] rounded-2xl p-2 flex items-end gap-2">
                                            <div className="flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                                                    title="Attach File"
                                                >
                                                    <Paperclip size={20} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = 'image/*';
                                                        input.multiple = true;
                                                        input.onchange = (e) => {
                                                            const files = Array.from(e.target.files);
                                                            setData('attachments', [...data.attachments, ...files]);
                                                        };
                                                        input.click();
                                                    }}
                                                    className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                                                    title="Add Image"
                                                >
                                                    <Image size={20} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => alert('Emoji picker coming soon!')}
                                                    className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                                                    title="Add Emoji"
                                                >
                                                    <Smile size={20} />
                                                </button>
                                                {!isRecording ? (
                                                    <button
                                                        type="button"
                                                        onMouseDown={startRecording}
                                                        onMouseUp={stopRecording}
                                                        onTouchStart={startRecording}
                                                        onTouchEnd={stopRecording}
                                                        className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                                                        title="Voice Message (Hold to record)"
                                                    >
                                                        <Mic size={20} />
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-xl animate-pulse">
                                                        <Mic size={20} />
                                                        <span className="text-sm font-medium">Recording {formatTime(recordingTime)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <textarea
                                                rows="1"
                                                value={data.content}
                                                onChange={e => {
                                                    setData('content', e.target.value);
                                                    if (window.Echo) {
                                                        window.Echo.join(`communication.channel.${selectedChannel.id}`)
                                                            .whisper('typing', {
                                                                id: auth.user.id,
                                                                name: auth.user.name
                                                            });
                                                    }
                                                }}
                                                placeholder="Type your message..."
                                                className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none text-sm py-2"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage(e);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={processing || (!data.content && data.attachments.length === 0)}
                                            className="p-3 bg-burgundy-600 hover:bg-burgundy-500 disabled:opacity-50 rounded-2xl text-white transition-colors"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileSelect}
                                    />
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="chat-empty-state flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-burgundy-600/20 to-burgundy-900/20 flex items-center justify-center">
                                    <MessageSquare size={48} className="text-burgundy-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Select a Conversation</h3>
                                <p className="text-gray-400 mb-4">Choose a channel from the sidebar or start a new chat</p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setShowUserSearch(true)}
                                        className="px-4 py-2 bg-burgundy-600 hover:bg-burgundy-500 text-white rounded-xl font-medium transition-colors"
                                    >
                                        <User size={16} className="inline mr-2" />
                                        Start Private Chat
                                    </button>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                                    >
                                        <Users size={16} className="inline mr-2" />
                                        Create Group
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CreateChannelModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                auth={auth}
            />

            {selectedChannel && (
                <ManageChannelModal
                    show={showManageModal}
                    onClose={() => setShowManageModal(false)}
                    channel={selectedChannel}
                    auth={auth}
                />
            )}
        </AuthenticatedLayout>
    );
}
