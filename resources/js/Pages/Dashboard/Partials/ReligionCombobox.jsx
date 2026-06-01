import { useState } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export default function ReligionCombobox({ religions, value, onChange, disabled = false }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);

    const selectedReligion = religions.find(r => String(r.id) === String(value));

    const filteredReligions = query === ''
        ? religions
        : religions.filter(r =>
            r.name.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
        );

    const showAddOption = query !== '' && !religions.some(r => r.name.toLowerCase() === query.toLowerCase());

    function selectOption(val) {
        onChange(val);
        setQuery('');
        setOpen(false);
    }

    return (
        <div className="form-group">
            <label>Religion</label>
            <div className="relative">
                {/* Trigger Button — looks like h-input */}
                <button
                    type="button"
                    disabled={disabled}
                    className="h-input w-full text-left flex items-center justify-between pr-10 relative"
                    onClick={() => setOpen(o => !o)}
                >
                    <span className={selectedReligion ? 'text-white' : 'text-muted'}>
                        {selectedReligion ? selectedReligion.name : 'Select religion...'}
                    </span>
                    <ChevronDown
                        size={16}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* Dropdown */}
                {open && (
                    <div
                        className="absolute z-50 mt-1 w-full rounded-xl overflow-hidden shadow-xl"
                        style={{ background: 'var(--clr-surface-800)', border: '1px solid var(--clr-border-strong)' }}
                    >
                        {/* Inline search */}
                        <div className="p-2 border-b border-white/5">
                            <div className="relative flex items-center">
                                <Search size={14} className="absolute left-3 text-muted pointer-events-none" />
                                <input
                                    className="h-input pl-8 w-full text-sm"
                                    placeholder="Search religion..."
                                    value={query}
                                    autoFocus
                                    onChange={e => setQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Options list */}
                        <div className="max-h-52 overflow-y-auto py-1">
                            {filteredReligions.length === 0 && !showAddOption && (
                                <div className="px-4 py-3 text-sm text-muted">Nothing found.</div>
                            )}
                            {filteredReligions.map(religion => {
                                const isSelected = String(religion.id) === String(value);
                                return (
                                    <button
                                        key={religion.id}
                                        type="button"
                                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-white/10 transition-colors"
                                        onClick={() => selectOption(religion.id)}
                                    >
                                        {isSelected
                                            ? <Check size={14} className="text-gold-400 shrink-0" />
                                            : <span className="w-3.5 shrink-0" />
                                        }
                                        <span className={isSelected ? 'font-bold text-gold-400' : 'text-white'}>
                                            {religion.name}
                                        </span>
                                    </button>
                                );
                            })}
                            {showAddOption && (
                                <button
                                    type="button"
                                    className="w-full text-left px-4 py-2.5 text-sm text-gold-400 hover:bg-white/10 transition-colors flex items-center gap-2"
                                    onClick={() => selectOption(query)}
                                >
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Add</span>
                                    "{query}"
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Click-away overlay */}
            {open && (
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            )}
        </div>
    );
}
