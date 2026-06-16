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
            <div style={{
                background: 'var(--clr-surface-900)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--clr-border)',
                color: 'var(--clr-text-primary)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '24px',
                    borderBottom: '1px solid var(--clr-border)'
                }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: 0
                    }}>
                        <Users size={20} style={{ color: 'var(--theme-primary)' }} />
                        Create Group Channel
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--clr-text-muted)',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--theme-bg-alpha)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={submit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--clr-text-muted)',
                                marginBottom: '4px'
                            }}>Channel Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'var(--theme-bg-alpha)',
                                    border: '1px solid var(--clr-border)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    color: 'var(--clr-text-primary)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--theme-primary)'}
                                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--clr-border)'}
                                placeholder="e.g. Master Guides 2026"
                                required
                            />
                            {errors.name && <p style={{ color: 'var(--clr-danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.name}</p>}
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--clr-text-muted)',
                                marginBottom: '4px'
                            }}>Description</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'var(--theme-bg-alpha)',
                                    border: '1px solid var(--clr-border)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    color: 'var(--clr-text-primary)',
                                    outline: 'none',
                                    resize: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--theme-primary)'}
                                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--clr-border)'}
                                placeholder="What is this channel about?"
                                rows="2"
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--clr-text-muted)',
                                marginBottom: '4px'
                            }}>Add Members</label>
                            <div style={{ position: 'relative' }}>
                                <Search style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--clr-text-muted)'
                                }} size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    style={{
                                        width: '100%',
                                        background: 'var(--theme-bg-alpha)',
                                        border: '1px solid var(--clr-border)',
                                        borderRadius: '12px',
                                        paddingLeft: '40px',
                                        paddingRight: '12px',
                                        paddingTop: '12px',
                                        paddingBottom: '12px',
                                        color: 'var(--clr-text-primary)',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--theme-primary)'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--clr-border)'}
                                    placeholder="Search users by name or email..."
                                />
                                {searching && <div style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid var(--theme-primary)',
                                    borderTopColor: 'transparent',
                                    borderRadius: '9999px',
                                    animation: 'spin 1s linear infinite'
                                }} />}
                            </div>

                            {searchResults.length > 0 && (
                                <div style={{
                                    marginTop: '8px',
                                    background: 'var(--clr-surface-950)',
                                    border: '1px solid var(--clr-border)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    maxHeight: '160px',
                                    overflowY: 'auto'
                                }}>
                                    {searchResults.map(user => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => addParticipant(user)}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px',
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                borderBottom: '1px solid var(--clr-border)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--theme-bg-alpha)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div>
                                                <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{user.email}</div>
                                            </div>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '9999px',
                                                background: 'var(--theme-bg-alpha-strong)',
                                                color: 'var(--theme-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Check size={14} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {data.participants.length > 0 && (
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'var(--clr-text-muted)',
                                    marginBottom: '8px'
                                }}>Selected Members ({data.participants.length})</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {data.participants.map(user => (
                                        <div key={user.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            background: 'var(--theme-bg-alpha-strong)',
                                            color: 'var(--theme-primary)',
                                            paddingLeft: '12px',
                                            paddingRight: '12px',
                                            paddingTop: '6px',
                                            paddingBottom: '6px',
                                            borderRadius: '9999px',
                                            border: '1px solid rgba(var(--theme-primary-rgb), 0.3)',
                                            fontSize: '0.875rem'
                                        }}>
                                            <span>{user.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeParticipant(user.id)}
                                                style={{
                                                    border: 'none',
                                                    background: 'transparent',
                                                    color: 'inherit',
                                                    cursor: 'pointer',
                                                    padding: 0
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--clr-border)'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--clr-text-muted)',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'background 0.2s, color 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'var(--theme-bg-alpha)';
                                e.currentTarget.style.color = 'var(--clr-text-primary)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--clr-text-muted)';
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.name}
                            style={{
                                padding: '10px 20px',
                                background: 'var(--theme-primary)',
                                color: 'white',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: processing ? 'not-allowed' : 'pointer',
                                opacity: processing ? '0.5' : '1',
                                fontWeight: '500'
                            }}
                        >
                            {processing ? 'Creating...' : 'Create Channel'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
