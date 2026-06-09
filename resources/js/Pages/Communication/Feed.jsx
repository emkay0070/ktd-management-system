import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Heart, MessageSquare, Share2, MoreHorizontal, 
    Zap, Calendar, MapPin, Shield, Star, Award
} from 'lucide-react';

export default function Feed({ auth, posts }) {
    const [localPosts, setLocalPosts] = useState(posts.data);
    const [commentContent, setCommentContent] = useState({});
    const [activeCommentPost, setActiveCommentPost] = useState(null);

    const toggleReaction = async (postId, emoji) => {
        try {
            const response = await axios.post(route('communication.messages.reactions.toggle', postId), { emoji });
            setLocalPosts(prev => prev.map(post => 
                post.id === postId ? { ...post, reactions: response.data } : post
            ));
        } catch (error) {
            console.error('Failed to toggle reaction', error);
        }
    };

    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        const content = commentContent[postId];
        if (!content) return;

        try {
            const response = await axios.post(route('communication.messages.comments.store', postId), { content });
            setLocalPosts(prev => prev.map(post => 
                post.id === postId ? { ...post, comments: [...(post.comments || []), response.data] } : post
            ));
            setCommentContent(prev => ({ ...prev, [postId]: '' }));
        } catch (error) {
            console.error('Failed to post comment', error);
        }
    };

    const getIconForChannel = (type) => {
        switch(type) {
            case 'union': return <Shield size={16} className="text-burgundy-400" />;
            case 'district': return <MapPin size={16} className="text-gold-400" />;
            case 'club': return <Zap size={16} className="text-blue-400" />;
            default: return <Award size={16} className="text-purple-400" />;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Ministry Timeline</h2>}
        >
            <Head title="Ministry Timeline" />

            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="space-y-8">
                    {localPosts.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <Calendar size={48} className="mx-auto text-gray-700 mb-4" />
                            <p className="text-gray-500 font-medium">No updates in your timeline yet.</p>
                        </div>
                    ) : (
                        localPosts.map(post => (
                            <div key={post.id} className="panel overflow-hidden border-white/5 bg-[#16161d]">
                                {/* Post Header */}
                                <div className="p-5 flex items-center justify-between border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-burgundy-600 to-burgundy-900 flex items-center justify-center text-white font-bold text-xs">
                                            {post.sender?.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-white">{post.sender?.name}</h4>
                                                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-full border border-white/10">
                                                    {getIconForChannel(post.channel?.type)}
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                                                        {post.channel?.name || post.channel?.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-0.5">
                                                {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-gray-600 hover:text-white transition-colors">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                {/* Post Content */}
                                <div className="p-6">
                                    <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                                        {post.content}
                                    </p>

                                    {post.attachments?.length > 0 && (
                                        <div className={`mt-4 grid gap-2 rounded-2xl overflow-hidden border border-white/5 ${
                                            post.attachments.filter(f => f.file_type.startsWith('image/')).length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                                        }`}>
                                            {post.attachments.map(file => (
                                                file.file_type.startsWith('image/') ? (
                                                    <img 
                                                        key={file.id} 
                                                        src={file.url} 
                                                        alt={file.file_name}
                                                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                                    />
                                                ) : (
                                                    <div key={file.id} className="p-4 bg-white/5 flex items-center gap-3 col-span-full">
                                                        <Award size={20} className="text-burgundy-400" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-white font-medium truncate">{file.file_name}</p>
                                                            <p className="text-[10px] text-gray-500">{(file.file_size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                        <a href={file.url} target="_blank" className="btn btn--secondary btn--sm">Download</a>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Post Footer / Actions */}
                                <div className="px-6 py-4 bg-black/20 flex items-center justify-between border-t border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center -space-x-1">
                                            {post.reactions?.reduce((acc, curr) => {
                                                if (!acc.includes(curr.emoji)) acc.push(curr.emoji);
                                                return acc;
                                            }, []).slice(0, 3).map(emoji => (
                                                <span key={emoji} className="w-6 h-6 rounded-full bg-[#16161d] border border-white/10 flex items-center justify-center text-xs shadow-lg">
                                                    {emoji}
                                                </span>
                                            ))}
                                            {post.reactions?.length > 0 && (
                                                <span className="pl-3 text-[10px] text-gray-500 font-bold">
                                                    {post.reactions.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => toggleReaction(post.id, '❤️')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                                                post.reactions?.some(r => r.user_id === auth.user.id && r.emoji === '❤️')
                                                ? 'bg-burgundy-500/20 text-burgundy-400'
                                                : 'hover:bg-white/5 text-gray-500'
                                            }`}
                                        >
                                            <Heart size={18} fill={post.reactions?.some(r => r.user_id === auth.user.id && r.emoji === '❤️') ? 'currentColor' : 'none'} />
                                            <span className="text-xs font-bold">Love</span>
                                        </button>
                                        <button 
                                            onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                                                activeCommentPost === post.id ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-500'
                                            }`}
                                        >
                                            <MessageSquare size={18} />
                                            <span className="text-xs font-bold">Discuss ({post.comments?.length || 0})</span>
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 text-gray-500 transition-all">
                                            <Share2 size={18} />
                                            <span className="text-xs font-bold">Share</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                {activeCommentPost === post.id && (
                                    <div className="bg-black/40 border-t border-white/5 p-6 space-y-6">
                                        <div className="space-y-4">
                                            {post.comments?.map(comment => (
                                                <div key={comment.id} className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-gray-500 shrink-0 uppercase font-black border border-white/5">
                                                        {comment.user?.name?.substring(0, 2)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 border border-white/5">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-bold text-white">{comment.user?.name}</span>
                                                                <span className="text-[9px] text-gray-600 uppercase font-black">
                                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 leading-relaxed">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-burgundy-900/30 flex items-center justify-center text-burgundy-400 shrink-0 uppercase font-black border border-burgundy-500/20 text-[10px]">
                                                {auth.user.name.substring(0, 2)}
                                            </div>
                                            <div className="flex-1 relative">
                                                <input 
                                                    type="text"
                                                    value={commentContent[post.id] || ''}
                                                    onChange={(e) => setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                    placeholder="Write a comment..."
                                                    className="w-full bg-white/5 border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:ring-burgundy-500 placeholder:text-gray-600"
                                                />
                                                <button 
                                                    type="submit"
                                                    disabled={!commentContent[post.id]}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-burgundy-400 hover:text-burgundy-300 disabled:opacity-30 transition-colors"
                                                >
                                                    <Zap size={14} />
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
