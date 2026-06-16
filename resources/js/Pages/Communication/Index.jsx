import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Send, Paperclip, Smile, Image, Mic, FileText, 
    MoreVertical, Search, Hash, MessageSquare, 
    Users, Info, ChevronLeft, Phone, Video, Plus
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
        // Leave previous channel
        if (selectedChannel && window.Echo) {
            window.Echo.leave(`communication.channel.${selectedChannel.id}`);
        }

        setSelectedChannel(channel);
        setLoading(true);
        setTypingUsers([]);
        try {
            const response = await axios.get(route('communication.show', channel.slug));
            setMessages(response.data.messages.data || response.data.messages);
            
            // Listen for new messages & presence if Echo is available
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
                        setMessages(prev => [...prev, e.message]);
                    })
                    .listen('.reaction.updated', (e) => {
                        setMessages(prev => prev.map(msg => 
                            msg.id === e.messageId ? { ...msg, reactions: e.reactions } : msg
                        ));
                    })
                    .listenForWhisper('typing', (e) => {
                        if (!typingUsers.find(u => u.id === e.id)) {
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
                console.log('Attaching file:', file.name, file.type, file.size);
            });

            // Log form data contents
            console.log('Sending form data:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const response = await axios.post(
                route('communication.messages.store', selectedChannel.slug),
                formData
            );

            console.log('Response:', response.data);

            // Add the new message to the messages array immediately
            if (response.data) {
                setMessages(prev => [...prev, response.data]);
            }

            reset();
        } catch (error) {
            console.error('Failed to send message:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
            }
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setData('attachments', [...data.attachments, ...files]);
    };

    const getChannelName = (channel) => {
        if (channel.type === 'direct') {
            const otherUser = channel.participants?.find(p => p.user_id !== auth.user.id);
            return otherUser ? otherUser.user.name : 'Direct Message';
        }
        return channel.name || `${channel.type.toUpperCase()} Channel`;
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

            <div className="communication-container" data-role-theme="district">
                {/* Sidebar */}
                <div className="communication-sidebar">
                    <div className="communication-sidebar-header">
                        <div className="communication-search">
                            <Search className="icon" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search conversations..." 
                            />
                        </div>
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="btn-icon"
                            title="Create Group Channel"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    
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
                                        <div className="unread-badge">
                                            {channel.unread_count}
                                        </div>
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
                                    <p className="preview">
                                        {channel.lastMessage ? channel.lastMessage.content : 'No messages yet'}
                                    </p>
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
                                    <button><Phone size={20} /></button>
                                    <button><Video size={20} /></button>
                                    <button onClick={() => setShowManageModal(true)}><Info size={20} /></button>
                                    <button onClick={() => setShowManageModal(true)}><MoreVertical size={20} /></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="chat-messages">
                                {loading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <div className="spinner">Loading...</div>
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
                                                                    {message.sender?.name?.substring(0, 2)}
                                                                </div>
                                                                {onlineUsers.find(u => u.id === message.sender_id) && (
                                                                    <div className="online-dot"></div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="message-body">
                                                            <div className="bubble">
                                                                {message.content}
                                                                
                                                                {message.attachments?.length > 0 && (
                                                                    <div className="attachments">
                                                                        {message.attachments.map(file => (
                                                                            file.file_type.startsWith('audio/') ? (
                                                                                <div key={file.id} className="audio-player">
                                                                                    <button className="icon-wrapper">
                                                                                        <Mic size={14} />
                                                                                    </button>
                                                                                    <audio controls src={file.url} />
                                                                                </div>
                                                                            ) : (
                                                                                <a 
                                                                                    key={file.id} 
                                                                                    href={file.url} 
                                                                                    target="_blank" 
                                                                                    className="file-link"
                                                                                >
                                                                                    <FileText size={16} />
                                                                                    <span className="filename">{file.file_name}</span>
                                                                                </a>
                                                                            )
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Reactions */}
                                                            <div className="reactions">
                                                                {message.reactions?.reduce((acc, curr) => {
                                                                    const existing = acc.find(a => a.emoji === curr.emoji);
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
                                                                
                                                                <div className="add-reaction">
                                                                    <button className="add-btn">
                                                                        <Smile size={12} />
                                                                    </button>
                                                                    <div className="emoji-picker">
                                                                        {['👍', '❤️', '🙏', '🎉', '🔥'].map(emoji => (
                                                                            <button 
                                                                                key={emoji}
                                                                                onClick={() => toggleReaction(message.id, emoji)}
                                                                            >
                                                                                {emoji}
                                                                            </button>
                                                                        ))}
                                                                    </div>
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
                                            <div style={{ fontSize: '10px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', animation: 'pulse 2s infinite' }}>
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
                                    <div className="input-wrapper">
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
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                        />
                                        
                                        {data.attachments.length > 0 && (
                                            <div className="attachment-preview">
                                                {data.attachments.map((file, i) => (
                                                    <div key={i} className="file-chip">
                                                        <FileText size={12} />
                                                        <span>{file.name}</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setData('attachments', data.attachments.filter((_, idx) => idx !== i))}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="input-actions">
                                            <div className="action-group">
                                                <button 
                                                    type="button" 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    title="Attach File"
                                                >
                                                    <Paperclip size={20} />
                                                </button>
                                                <button type="button" title="Add Image"><Image size={20} /></button>
                                                <button type="button" title="Add Emoji"><Smile size={20} /></button>
                                                <button 
                                                    type="button" 
                                                    onMouseDown={startRecording}
                                                    onMouseUp={stopRecording}
                                                    onTouchStart={startRecording}
                                                    onTouchEnd={stopRecording}
                                                    className={isRecording ? 'recording' : ''}
                                                    title="Voice Message"
                                                >
                                                    <Mic size={20} />
                                                </button>
                                                {isRecording && (
                                                    <span className="recording-time">
                                                        Recording {formatTime(recordingTime)}
                                                    </span>
                                                )}
                                            </div>
                                            <input 
                                                type="file" 
                                                multiple 
                                                ref={fileInputRef} 
                                                style={{ display: 'none' }} 
                                                onChange={handleFileSelect}
                                            />
                                        </div>
                                    </div>
                                    
                                    <button 
                                        type="submit"
                                        disabled={processing || (!data.content && data.attachments.length === 0)}
                                        className="send-btn"
                                    >
                                        <Send size={24} />
                                    </button>
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
