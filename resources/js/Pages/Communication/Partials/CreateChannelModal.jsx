import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { X, Users, Search, Check } from 'lucide-react';
import axios from 'axios';

export default function CreateChannelModal({ show, onClose, auth }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        description: '',
        participants: [],
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await axios.get(route('communication.users.search', { q: query }));
            // Filter out current user and already added participants
            const filtered = response.data.filter(u => 
                u.id !== auth.user.id && !data.participants.find(p => p.id === u.id)
            );
            setSearchResults(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    const addParticipant = (user) => {
        setData('participants', [...data.participants, user]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeParticipant = (userId) => {
        setData('participants', data.participants.filter(p => p.id !== userId));
    };

    const submit = (e) => {
        e.preventDefault();
        
        setData('participants', data.participants.map(p => p.id));

        post(route('communication.channels.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="bg-[#16161d] rounded-xl overflow-hidden border border-white/10 text-white">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Users className="text-burgundy-500" />
                        Create Group Channel
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Channel Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-white focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500"
                                placeholder="e.g. Master Guides 2026"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-white focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500"
                                placeholder="What is this channel about?"
                                rows="2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Add Members</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 p-3 text-white focus:border-burgundy-500 focus:ring-1 focus:ring-burgundy-500"
                                    placeholder="Search users by name or email..."
                                />
                                {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-burgundy-500 border-t-transparent rounded-full animate-spin" />}
                            </div>

                            {searchResults.length > 0 && (
                                <div className="mt-2 bg-[#0f0f15] border border-white/5 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                                    {searchResults.map(user => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => addParticipant(user)}
                                            className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
                                        >
                                            <div>
                                                <div className="font-medium text-sm">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-burgundy-500/20 text-burgundy-400 flex items-center justify-center">
                                                <Check size={14} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {data.participants.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Selected Members ({data.participants.length})</label>
                                <div className="flex flex-wrap gap-2">
                                    {data.participants.map(user => (
                                        <div key={user.id} className="flex items-center gap-2 bg-burgundy-500/20 text-burgundy-400 px-3 py-1.5 rounded-full border border-burgundy-500/30 text-sm">
                                            <span>{user.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeParticipant(user.id)}
                                                className="hover:text-white transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.name}
                            className="px-5 py-2.5 bg-burgundy-600 hover:bg-burgundy-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Creating...' : 'Create Channel'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
