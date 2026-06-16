import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Send, Paperclip, Smile, Image, Mic, FileText,
    MoreVertical, Search, Hash, MessageSquare,
    Users, Info, ChevronLeft, Phone, Video, Plus, X, User,
    StopCircle
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

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = () => {};
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
            chunksRef.current = [];
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

            <div className="communication-container h-[calc(100vh-140px)] flex rounded-3xl overflow-hidden shadow-2xl mx-4" data-role-theme="district">
                {/* Sidebar */}
                <div className="communication-sidebar w-80 bg-[#1a1a2e] border-r border-white/5 flex flex-col">
                    <div className="communication-sidebar-header p-5 border-b border-white/5 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xl text-white">Messages</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowUserSearch(!showUserSearch)}
                                    className={`p-2.5 rounded-xl transition-all ${showUserSearch ? 'bg-burgundy-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    title="Start New Chat"
                                >
                                    <User size={18} />
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="p-2.5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white rounded-xl transition-all"
                                    title="Create Group Channel"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="communication-search relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 outline-none"
                            />
                        </div>
                    </div>

                    {showUserSearch && (
                        <div className="p-4 border-b border-white/5 bg-[#16213e]">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleUserSearch}
                                placeholder="Search users to message..."
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500 outline-none"
                            />
                            {searching && <div className="text-center py-3 text-gray-500 text-xs">Searching...</div>}
                            {searchResults.length > 0 && (
                                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                    {searchResults.map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => startDirectMessage(user)}
                                            className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/5 transition-all text-left"
                                        >
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-burgundy-500 to-burgundy-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-white text-sm">{user.name}</div>
                                                <div className="text-xs text-gray-400 truncate">{user.email}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="communication-channel-list flex-1 overflow-y-auto p-3 custom-scrollbar">
                        {channels.map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => selectChannel(channel)}
                                className={`channel-item w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all mb-1 ${selectedChannel?.id === channel.id ? 'bg-gradient-to-r from-burgundy-600/30 to-burgundy-700/20 border border-burgundy-500/30' : 'hover:bg-white/5'}`}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-burgundy-600 to-burgundy-800 flex items-center justify-center text-white font-bold shadow-lg">
                                        {channel.type === 'direct' ? <MessageSquare size={18} /> : <Hash size={18} />}
                                    </div>
                                    {channel.unread_count > 0 && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-burgundy-500 to-burgundy-700 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-[#1a1a2e]">
                                            {channel.unread_count}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-white text-sm truncate">{getChannelName(channel)}</span>
                                        {channel.lastMessage && (
                                            <span className="text-xs text-gray-400 shrink-0">
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
                <div className="communication-chat-area flex-1 flex flex-col bg-gradient-to-b from-[#16213e] to-[#1a1a2e]">
                    {selectedChannel ? (
                        <>
                            {/* Chat Header */}
                            <div className="chat-header p-5 border-b border-white/5 bg-[#16213e]/80 backdrop-blur-sm flex items-center justify-between">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-burgundy-600 to-burgundy-800 flex items-center justify-center text-white font-bold shadow-lg">
                                        {selectedChannel.type === 'direct' ? <MessageSquare size={20} /> : <Hash size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{getChannelName(selectedChannel)}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                            <span>{getChannelTypeLabel(selectedChannel.type)}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/30"></span>
                                                {onlineUsers.length} online
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => alert('Voice calls coming soon!')} className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                                        <Phone size={18} />
                                    </button>
                                    <button onClick={() => alert('Video calls coming soon!')} className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                                        <Video size={18} />
                                    </button>
                                    <button onClick={() => setShowManageModal(true)} className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                                        <Info size={18} />
                                    </button>
                                    <button onClick={() => setShowManageModal(true)} className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="chat-messages flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-gray-400 flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-burgundy-500 border-t-transparent rounded-full animate-spin"></div>
                                            Loading messages...
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message, idx) => {
                                            const isMe = message.sender_id === auth.user.id;
                                            return (
                                                <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className="flex gap-3 max-w-[65%]">
                                                        {!isMe && (
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-burgundy-600 to-burgundy-800 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg">
                                                                {message.sender?.name?.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className={`space-y-1.5 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                                            {!isMe && (
                                                                <div className="text-xs text-gray-400 font-medium ml-1">
                                                                    {message.sender?.name}
                                                                </div>
                                                            )}
                                                            <div className={`p-4 rounded-2xl shadow-lg ${isMe ? 'bg-gradient-to-br from-burgundy-600 to-burgundy-700 text-white rounded-tr-md' : 'bg-[#2a2a45] text-white rounded-tl-md'}`}>
                                                                {message.content && (
                                                                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                                                                )}
                                                                {message.attachments?.length > 0 && (
                                                                    <div className={`mt-3 space-y-2.5 ${message.content ? 'pt-3 border-t border-white/10' : ''}`}>
                                                                        {message.attachments.map(file => (
                                                                            <div key={file.id}>
                                                                                {file.file_type.startsWith('image/') ? (
                                                                                    <img
                                                                                        src={file.url}
                                                                                        alt={file.file_name}
                                                                                        className="max-w-full rounded-xl max-h-72 object-cover shadow-md cursor-pointer hover:scale-[1.01] transition-transform"
                                                                                    />
                                                                                ) : file.file_type.startsWith('audio/') ? (
                                                                                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
                                                                                        <div className="p-2.5 bg-white/10 rounded-full">
                                                                                            <Mic size={18} />
                                                                                        </div>
                                                                                        <audio controls src={file.url} className="h-11 flex-1" />
                                                                                    </div>
                                                                                ) : (
                                                                                    <a
                                                                                        href={file.url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="flex items-center gap-3 p-3.5 bg-black/20 rounded-xl hover:bg-black/30 transition-all"
                                                                                    >
                                                                                        <FileText size={22} className="text-burgundy-400" />
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
                                                                    <div className="flex gap-1.5">
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
                                                                                className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${reaction.isMe ? 'bg-burgundy-500/30 text-burgundy-400 border border-burgundy-500/20' : 'bg-white/5 text-gray-300 border border-white/10'}`}
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
                                            <div className="text-sm text-gray-400 italic flex items-center gap-2 ml-12">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                                </div>
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
                            <div className="chat-input-area p-4 border-t border-white/5 bg-[#16213e]">
                                <form onSubmit={handleSendMessage} className="space-y-3">
                                    {data.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {data.attachments.map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2">
                                                    <FileText size={14} className="text-gray-400" />
                                                    <span className="text-sm text-gray-300 truncate max-w-[200px]">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(idx)}
                                                        className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {isRecording ? (
                                        <div className="flex items-center gap-3 bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/30 rounded-2xl p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/30"></div>
                                                <span className="text-red-400 font-medium">Recording</span>
                                                <span className="text-red-300 font-mono text-lg">{formatTime(recordingTime)}</span>
                                            </div>
                                            <div className="flex-1"></div>
                                            <button
                                                type="button"
                                                onClick={cancelRecording}
                                                className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={stopRecording}
                                                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-red-500/25 flex items-center gap-2"
                                            >
                                                <StopCircle size={16} />
                                                Stop
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-end gap-3">
                                            <div className="flex-1 bg-[#2a2a45] rounded-2xl p-2.5 flex items-end gap-1.5 border border-white/5">
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                                                        title="Attach File"
                                                    >
                                                        <Paperclip size={18} />
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
                                                        className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                                                        title="Add Image"
                                                    >
                                                        <Image size={18} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => alert('Emoji picker coming soon!')}
                                                        className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                                                        title="Add Emoji"
                                                    >
                                                        <Smile size={18} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={startRecording}
                                                        className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                                                        title="Voice Message"
                                                    >
                                                        <Mic size={18} />
                                                    </button>
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
                                                    className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none text-sm py-2 px-2"
                                                    style={{ minHeight: '24px', maxHeight: '120px' }}
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
                                                className="p-3.5 bg-gradient-to-r from-burgundy-600 to-burgundy-700 hover:from-burgundy-500 hover:to-burgundy-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white transition-all shadow-lg shadow-burgundy-500/25"
                                            >
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    )}
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
                        <div className="chat-empty-state flex-1 flex items-center justify-center p-10">
                            <div className="text-center max-w-md">
                                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-burgundy-600/20 to-burgundy-800/20 flex items-center justify-center shadow-inner">
                                    <MessageSquare size={56} className="text-burgundy-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Select a Conversation</h3>
                                <p className="text-gray-400 mb-8 text-base">Choose a channel from the sidebar or start a new chat</p>
                                <div className="flex gap-4 justify-center flex-wrap">
                                    <button
                                        onClick={() => setShowUserSearch(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-burgundy-600 to-burgundy-700 hover:from-burgundy-500 hover:to-burgundy-600 text-white rounded-2xl font-medium transition-all shadow-lg shadow-burgundy-500/25 flex items-center gap-2"
                                    >
                                        <User size={18} />
                                        Start Private Chat
                                    </button>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-medium transition-all border border-white/10 flex items-center gap-2"
                                    >
                                        <Users size={18} />
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
