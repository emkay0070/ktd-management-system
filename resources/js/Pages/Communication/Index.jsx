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
        if (selectedChannel) {
            window.Echo.leave(`communication.channel.${selectedChannel.id}`);
        }

        setSelectedChannel(channel);
        setLoading(true);
        setTypingUsers([]);
        try {
            const response = await axios.get(route('communication.show', channel.slug));
            setMessages(response.data.messages.data);
            
            // Listen for new messages & presence
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

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!data.content && data.attachments.length === 0) return;

        post(route('communication.messages.store', selectedChannel.slug), {
            preserveScroll: true,
            onSuccess: (page) => {
                reset();
                // Message will be added via Echo or manually if needed
                // In this implementation, store returns the message, we can add it manually too
            },
        });
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setData('attachments', [...data.attachments, ...files]);
    };

    const getChannelName = (channel) => {
        if (channel.type === 'direct') {
            const otherUser = channel.participants.find(p => p.user_id !== auth.user.id);
            return otherUser ? otherUser.user.name : 'Direct Message';
        }
        return channel.name || `${channel.type.toUpperCase()} Channel`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Communication Center</h2>}
        >
            <Head title="Communication Center" />

            <div className="flex h-[calc(100vh-140px)] bg-[#0f0f15] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                {/* Sidebar */}
                <div className="w-80 border-r border-white/5 flex flex-col bg-[#16161d]">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search conversations..." 
                                className="w-full bg-white/5 border-none rounded-xl pl-10 text-sm focus:ring-burgundy-500 text-white placeholder:text-gray-600"
                            />
                        </div>
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0"
                            title="Create Group Channel"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-4 space-y-1">
                            {channels.map(channel => (
                                <button
                                    key={channel.id}
                                    onClick={() => selectChannel(channel)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                                        selectedChannel?.id === channel.id 
                                        ? 'bg-burgundy-500/10 text-burgundy-400 border border-burgundy-500/20' 
                                        : 'hover:bg-white/5 text-gray-400 border border-transparent'
                                    }`}
                                >
                                    <div className="relative">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-burgundy-600 to-burgundy-900 flex items-center justify-center text-white font-bold text-sm">
                                            {channel.type === 'direct' ? <MessageSquare size={18} /> : <Hash size={18} />}
                                        </div>
                                        {channel.unread_count > 0 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-burgundy-500 rounded-full border-2 border-[#16161d] flex items-center justify-center text-[10px] text-white font-black">
                                                {channel.unread_count}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold truncate text-sm">{getChannelName(channel)}</span>
                                            {channel.lastMessage && (
                                                <span className="text-[10px] text-gray-600">
                                                    {new Date(channel.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {channel.lastMessage ? channel.lastMessage.content : 'No messages yet'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-[#0f0f15]">
                    {selectedChannel ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-[#16161d]/50 backdrop-blur-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-burgundy-500/20 flex items-center justify-center text-burgundy-400">
                                        {selectedChannel.type === 'direct' ? <MessageSquare size={20} /> : <Hash size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{getChannelName(selectedChannel)}</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                                                {selectedChannel.type} • {selectedChannel.participants?.length || 0} Members
                                            </p>
                                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                            <p className="text-[10px] text-green-500 uppercase tracking-widest font-black flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                {onlineUsers.length} Online
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-gray-400">
                                    <button className="p-2 hover:bg-white/5 rounded-xl transition-colors"><Phone size={20} /></button>
                                    <button className="p-2 hover:bg-white/5 rounded-xl transition-colors"><Video size={20} /></button>
                                    <button onClick={() => setShowManageModal(true)} className="p-2 hover:bg-white/5 rounded-xl transition-colors hover:text-burgundy-400"><Info size={20} /></button>
                                    <button onClick={() => setShowManageModal(true)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><MoreVertical size={20} /></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="w-8 h-8 border-2 border-burgundy-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message, idx) => {
                                            const isMe = message.sender_id === auth.user.id;
                                            return (
                                                <div key={message.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`max-w-[70%] flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                        {!isMe && (
                                                            <div className="relative">
                                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-gray-500 shrink-0 uppercase font-black border border-white/5">
                                                                    {message.sender?.name?.substring(0, 2)}
                                                                </div>
                                                                {onlineUsers.find(u => u.id === message.sender_id) && (
                                                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0f0f15]"></div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="space-y-1">
                                                            <div className={`p-4 rounded-3xl text-sm ${
                                                                isMe 
                                                                ? 'bg-burgundy-600 text-white rounded-tr-none shadow-lg shadow-burgundy-900/20' 
                                                                : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'
                                                            }`}>
                                                                {message.content}
                                                                
                                                                {message.attachments?.length > 0 && (
                                                                    <div className="mt-3 grid grid-cols-1 gap-2">
                                                                        {message.attachments.map(file => (
                                                                            file.file_type.startsWith('audio/') ? (
                                                                                <div key={file.id} className="w-full max-w-[240px] bg-black/20 p-2 rounded-2xl flex items-center gap-3">
                                                                                    <button className="w-8 h-8 rounded-full bg-burgundy-500 flex items-center justify-center text-white">
                                                                                        <Mic size={14} />
                                                                                    </button>
                                                                                    <audio controls src={file.url} className="h-8 w-full custom-audio-player" />
                                                                                </div>
                                                                            ) : (
                                                                                <a 
                                                                                    key={file.id} 
                                                                                    href={file.url} 
                                                                                    target="_blank" 
                                                                                    className="flex items-center gap-3 p-2 bg-black/20 rounded-xl hover:bg-black/30 transition-colors"
                                                                                >
                                                                                    <FileText size={16} />
                                                                                    <span className="text-xs truncate max-w-[150px]">{file.file_name}</span>
                                                                                </a>
                                                                            )
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Reactions */}
                                                            <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
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
                                                                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] transition-all border ${
                                                                            reaction.isMe 
                                                                            ? 'bg-burgundy-500/20 border-burgundy-500/50 text-burgundy-400' 
                                                                            : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                                                                        }`}
                                                                    >
                                                                        <span>{reaction.emoji}</span>
                                                                        <span className="font-black">{reaction.count}</span>
                                                                    </button>
                                                                ))}
                                                                
                                                                <div className="group relative">
                                                                    <button className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-500 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                                                                        <Smile size={12} />
                                                                    </button>
                                                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex items-center gap-1 bg-[#16161d] border border-white/10 p-1.5 rounded-xl shadow-2xl z-10">
                                                                        {['👍', '❤️', '🙏', '🎉', '🔥'].map(emoji => (
                                                                            <button 
                                                                                key={emoji}
                                                                                onClick={() => toggleReaction(message.id, emoji)}
                                                                                className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-all text-base"
                                                                            >
                                                                                {emoji}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <span className="text-[9px] text-gray-600 uppercase tracking-widest font-black px-1">
                                                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {typingUsers.length > 0 && (
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest animate-pulse">
                                                <div className="flex gap-1">
                                                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
                                                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                                                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                                                </div>
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
                            <div className="p-8 bg-[#16161d]/30 backdrop-blur-xl border-t border-white/5">
                                <form onSubmit={handleSendMessage} className="relative flex items-end gap-4">
                                    <div className="flex-1 bg-white/5 rounded-3xl border border-white/5 focus-within:border-burgundy-500/50 transition-all overflow-hidden p-2 px-4">
                                        <textarea 
                                            rows="1"
                                            value={data.content}
                                            onChange={e => {
                                                setData('content', e.target.value);
                                                window.Echo.join(`communication.channel.${selectedChannel.id}`)
                                                    .whisper('typing', {
                                                        id: auth.user.id,
                                                        name: auth.user.name
                                                    });
                                            }}
                                            placeholder="Type your message..."
                                            className="w-full bg-transparent border-none text-white text-sm focus:ring-0 placeholder:text-gray-600 resize-none py-3"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                        />
                                        
                                        {data.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2 p-2 border-t border-white/5">
                                                {data.attachments.map((file, i) => (
                                                    <div key={i} className="flex items-center gap-2 bg-white/5 p-1.5 px-3 rounded-full text-[10px] text-burgundy-400 border border-burgundy-500/20">
                                                        <FileText size={12} />
                                                        <span>{file.name}</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setData('attachments', data.attachments.filter((_, idx) => idx !== i))}
                                                            className="hover:text-white"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pb-1 px-1">
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    type="button" 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-2 text-gray-500 hover:text-burgundy-400 transition-colors"
                                                >
                                                    <Paperclip size={20} />
                                                </button>
                                                <button type="button" className="p-2 text-gray-500 hover:text-burgundy-400 transition-colors"><Image size={20} /></button>
                                                <button type="button" className="p-2 text-gray-500 hover:text-burgundy-400 transition-colors"><Smile size={20} /></button>
                                                <button 
                                                    type="button" 
                                                    onMouseDown={startRecording}
                                                    onMouseUp={stopRecording}
                                                    onTouchStart={startRecording}
                                                    onTouchEnd={stopRecording}
                                                    className={`p-2 transition-colors ${isRecording ? 'text-burgundy-500 animate-pulse' : 'text-gray-500 hover:text-burgundy-400'}`}
                                                >
                                                    <Mic size={20} />
                                                </button>
                                                {isRecording && (
                                                    <span className="text-[10px] text-burgundy-500 font-black uppercase tracking-widest ml-2">
                                                        Recording {formatTime(recordingTime)}
                                                    </span>
                                                )}
                                            </div>
                                            <input 
                                                type="file" 
                                                multiple 
                                                ref={fileInputRef} 
                                                className="hidden" 
                                                onChange={handleFileSelect}
                                            />
                                        </div>
                                    </div>
                                    
                                    <button 
                                        type="submit"
                                        disabled={processing || (!data.content && data.attachments.length === 0)}
                                        className="w-14 h-14 bg-burgundy-600 hover:bg-burgundy-500 text-white rounded-3xl flex items-center justify-center transition-all shadow-lg shadow-burgundy-900/30 disabled:opacity-50 disabled:grayscale shrink-0"
                                    >
                                        <Send size={24} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-gray-700 mb-6">
                                <MessageSquare size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Select a Conversation</h3>
                            <p className="text-gray-500 max-w-sm">
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

            <ManageChannelModal 
                show={showManageModal} 
                onClose={() => setShowManageModal(false)} 
                channel={selectedChannel} 
                auth={auth} 
            />
        </AuthenticatedLayout>
    );
}
