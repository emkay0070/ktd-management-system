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
    const [showReactionPicker, setShowReactionPicker] = useState(null); // track which message's picker to show
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
            console.error('Failed to send message', error);
            if (error.response) {
                console.error('Error response data', error.response.data);
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

            <div className="communication-container">
                {/* Sidebar */}
                <div className="communication-sidebar">
                    <div className="communication-sidebar-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', width: '100%' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--clr-text-primary)', margin: 0 }}>Messages</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setShowUserSearch(!showUserSearch)}
                                    className="btn-icon"
                                    title="Start New Chat"
                                >
                                    <User size={18} />
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="btn-icon"
                                    title="Create Group Channel"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="communication-search">
                            <Search className="icon" size={16} />
                            <input type="text" placeholder="Search conversations..." />
                        </div>
                    </div>

                    {showUserSearch && (
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-surface-900)' }}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleUserSearch}
                                placeholder="Search users to message..."
                                style={{
                                    width: '100%',
                                    background: 'var(--theme-bg-alpha)',
                                    border: '1px solid var(--clr-border)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '12px 16px',
                                    color: 'var(--clr-text-primary)',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                            {searching && <div style={{ textAlign: 'center', padding: '12px', color: 'var(--clr-text-muted)', fontSize: '12px' }}>Searching...</div>}
                            {searchResults.length > 0 && (
                                <div style={{ marginTop: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                                    {searchResults.map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => startDirectMessage(user)}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px',
                                                borderRadius: 'var(--radius-lg)',
                                                cursor: 'pointer',
                                                background: 'transparent',
                                                border: 'none'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--theme-bg-alpha)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(to bottom right, var(--theme-gradient-1), var(--theme-gradient-2))',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: '700',
                                                fontSize: '14px'
                                            }}>
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--clr-text-primary)', fontSize: '14px' }}>{user.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{user.email}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="communication-channel-list">
                        {channels.map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => selectChannel(channel)}
                                className={`channel-item ${selectedChannel?.id === channel.id ? 'active' : ''}`}
                            >
                                <div className="channel-icon">
                                    <div className="icon-bg">
                                        {channel.type === 'direct' ? <MessageSquare size={18} /> : <Hash size={18} />}
                                    </div>
                                    {channel.unread_count > 0 && (
                                        <div className="unread-badge">{channel.unread_count}</div>
                                    )}
                                </div>
                                <div className="channel-info">
                                    <div className="header">
                                        <span className="name">{getChannelName(channel)}</span>
                                        {channel.lastMessage && (
                                            <span className="time">
                                                {new Date(channel.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="preview">{getLastMessagePreview(channel.lastMessage)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="communication-chat-area">
                    {selectedChannel ? (
                        <>
                            {/* Chat Header */}
                            <div className="chat-header">
                                <div className="chat-title-wrapper">
                                    <div className="icon-bg">
                                        {selectedChannel.type === 'direct' ? <MessageSquare size={20} /> : <Hash size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="title">{getChannelName(selectedChannel)}</h3>
                                        <div className="meta">
                                            <p className="type">
                                                {getChannelTypeLabel(selectedChannel.type)} • {selectedChannel.participants?.length || 0} Members
                                            </p>
                                            <span className="dot"></span>
                                            <p className="online">
                                                <span className="pulse"></span>
                                                {onlineUsers.length} Online
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="chat-actions">
                                    <button onClick={() => alert('Voice calls coming soon!')}><Phone size={18} /></button>
                                    <button onClick={() => alert('Video calls coming soon!')}><Video size={18} /></button>
                                    <button onClick={() => setShowManageModal(true)}><Info size={18} /></button>
                                    <button onClick={() => setShowManageModal(true)}><MoreVertical size={18} /></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="chat-messages">
                                {loading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--clr-text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '20px', height: '20px', border: '2px solid var(--theme-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                            Loading messages...
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message, idx) => {
                                            const isMe = message.sender_id === auth.user.id;
                                            return (
                                                <div key={message.id} className={`message-wrapper ${isMe ? 'me' : 'them'}`}>
                                                    <div className="message-content">
                                                        {!isMe && (
                                                            <div className="avatar-wrapper">
                                                                <div className="avatar">
                                                                    {message.sender?.name?.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                {onlineUsers.find(u => u.id === message.sender_id) && (
                                                                    <div className="online-dot"></div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="message-body">
                                                            {!isMe && (
                                                                <div style={{ fontSize: '10px', color: 'var(--clr-text-muted)', fontWeight: '700', marginBottom: '4px', marginLeft: '4px' }}>
                                                                    {message.sender?.name}
                                                                </div>
                                                            )}
                                                            <div className="bubble">
                                                                {message.content && (
                                                                    <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                                                        {message.content}
                                                                    </div>
                                                                )}

                                                                {message.attachments?.length > 0 && (
                                                                    <div className="attachments">
                                                                        {message.attachments.map(file => (
                                                                            <div key={file.id}>
                                                                                {file.file_type.startsWith('image/') ? (
                                                                                    <img
                                                                                        src={file.url}
                                                                                        alt={file.file_name}
                                                                                        style={{
                                                                                            maxWidth: '100%',
                                                                                            maxHeight: '300px',
                                                                                            borderRadius: '12px',
                                                                                            marginTop: '12px'
                                                                                        }}
                                                                                    />
                                                                                ) : file.file_type.startsWith('audio/') ? (
                                                                                    <div className="audio-player">
                                                                                        <div className="icon-wrapper">
                                                                                            <Mic size={16} />
                                                                                        </div>
                                                                                        <audio controls src={file.url} style={{ width: '100%' }} />
                                                                                    </div>
                                                                                ) : (
                                                                                    <a
                                                                                        href={file.url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="file-link"
                                                                                    >
                                                                                        <FileText size={20} />
                                                                                        <span className="filename">{file.file_name}</span>
                                                                                    </a>)
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="reactions">
                                                                {message.reactions?.reduce((acc, curr) => {
                                                                    const existing = acc.find(r => r.emoji === curr.emoji);
                                                                    if (existing) {
                                                                        existing.count++;
                                                                        if (curr.user_id === auth.user.id) existing.isMe = true;
                                                                    } else {
                                                                        acc.push({ emoji: curr.emoji, count: 1, isMe: curr.user_id === auth.user.id });
                                                                    }
                                                                    return acc;
                                                                }, []).map(reaction => (
                                                                    <button
                                                                        key={reaction.emoji}
                                                                        onClick={() => toggleReaction(message.id, reaction.emoji)}
                                                                        className={`reaction-btn ${reaction.isMe ? 'active' : ''}`}
                                                                    >
                                                                        <span>{reaction.emoji}</span>
                                                                        <span className="count">{reaction.count}</span>
                                                                    </button>
                                                                ))}

                                                                <div className="add-reaction" style={{ position: 'relative' }}>
                                                                    <button
                                                                        className="add-btn"
                                                                        onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                                                                        style={{ opacity: 1 }}
                                                                    >
                                                                        <Smile size={12} />
                                                                    </button>
                                                                    {showReactionPicker === message.id && (
                                                                        <div className="communication-reaction-picker" style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '8px' }}>
                                                                            {['👍', '❤️', '🙏', '🎉', '🔥', '😂', '😮', '😢', '😡'].map(emoji => (
                                                                                <button
                                                                                    key={emoji}
                                                                                    onClick={() => {
                                                                                        toggleReaction(message.id, emoji);
                                                                                        setShowReactionPicker(null);
                                                                                    }}
                                                                                >
                                                                                    {emoji}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <span className="time">
                                                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {typingUsers.length > 0 && (
                                            <div style={{
                                                fontSize: '10px',
                                                color: 'var(--clr-text-muted)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                animation: 'pulse 2s infinite',
                                                marginLeft: '56px'
                                            }}>
                                                {typingUsers.length === 1
                                                    ? `${typingUsers[0].name} is typing...`
                                                    : 'Multiple people are typing...'
                                                }
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="chat-input-area">
                                <form onSubmit={handleSendMessage}>
                                    {data.attachments.length > 0 && (
                                        <div className="attachment-preview">
                                            {data.attachments.map((file, i) => (
                                                <div key={i} className="file-chip">
                                                    <FileText size={12} />
                                                    <span>{file.name}</span>
                                                    <button type="button" onClick={() => removeAttachment(i)} style={{
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: 'inherit',
                                                        cursor: 'pointer'
                                                    }}>
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {isRecording ? (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '16px',
                                            padding: '16px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    background: 'rgb(239, 68, 68)',
                                                    borderRadius: '50%',
                                                    animation: 'pulse 2s infinite'
                                                }}></div>
                                                <span style={{ color: 'rgb(239, 68, 68)', fontWeight: '700' }}>Recording</span>
                                                <span style={{ color: 'rgb(248, 113, 113)', fontFamily: 'monospace', fontSize: '18px' }}>{formatTime(recordingTime)}</span>
                                            </div>
                                            <div style={{ flex: '1' }}></div>
                                            <button type="button" onClick={cancelRecording} style={{
                                                padding: '8px 16px',
                                                background: 'rgba(75, 85, 99, 0.5)',
                                                color: 'rgb(209, 213, 219)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}>
                                                Cancel
                                            </button>
                                            <button type="button" onClick={stopRecording} style={{
                                                padding: '8px 16px',
                                                background: 'linear-gradient(to right, rgb(220, 38, 38), rgb(185, 28, 28))',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <StopCircle size={16} />
                                                Stop
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                                            <div className="input-wrapper">
                                                <div className="input-actions">
                                                    <div className="action-group">
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
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
                                                            title="Add Image"
                                                        >
                                                            <Image size={20} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => alert('Emoji picker coming soon!')}
                                                            title="Add Emoji"
                                                        >
                                                            <Smile size={20} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={startRecording}
                                                            title="Voice Message"
                                                        >
                                                            <Mic size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <textarea
                                                    rows="1"
                                                    value={data.content}
                                                    onChange={(e) => {
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
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendMessage(e);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <button type="submit" disabled={processing || (!data.content && data.attachments.length === 0)} className="send-btn">
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    )}
                                    <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="chat-empty-state">
                            <div className="icon-wrapper">
                                <MessageSquare size={48} />
                            </div>
                            <h3>Select a Conversation</h3>
                            <p>
                                Choose a channel from the sidebar or start a new direct message with a fellow leader or parent.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button
                                    onClick={() => setShowUserSearch(true)}
                                    style={{
                                        padding: '12px 24px',
                                        background: 'linear-gradient(to right, var(--theme-gradient-1), var(--theme-gradient-2))',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <User size={18} />
                                    Start Private Chat
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    style={{
                                        padding: '12px 24px',
                                        background: 'var(--theme-bg-alpha)',
                                        color: 'var(--clr-text-primary)',
                                        border: '1px solid var(--clr-border)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Users size={18} />
                                    Create Group
                                </button>
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
