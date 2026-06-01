import { Book, Download, FileText, Search, FolderOpen } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function ClubResourcesView({ resources = [] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredResources = useMemo(() => {
        return resources.filter(res => 
            res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            res.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [resources, searchTerm]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(212,160,23,0.1)', borderRadius: '10px', color: 'var(--clr-gold-400)' }}>
                    <Book size={24} />
                </div>
                <div>
                    <h3 style={{ margin: 0, color: '#fff' }}>District Resource Vault</h3>
                    <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Official manuals, training guides, and curriculum shared by the District.</p>
                </div>
            </div>

            <div className="panel" style={{ padding: '12px 16px' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input 
                        type="text" 
                        className="h-input" 
                        placeholder="Search for a manual or document..." 
                        style={{ paddingLeft: '40px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredResources.map(res => (
                    <div key={res.id} className="panel" style={{ borderLeft: '3px solid var(--clr-gold-500)', background: 'linear-gradient(to right, rgba(212, 160, 23, 0.05), transparent)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div className="badge badge--gold">{res.category}</div>
                            <div style={{ fontSize: '10px', color: 'var(--clr-text-muted)', fontWeight: 800 }}>{res.file_size}</div>
                        </div>
                        
                        <h4 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '16px' }}>{res.title}</h4>
                        <p style={{ fontSize: '13px', color: 'var(--clr-text-secondary)', marginBottom: '20px', minHeight: '40px' }}>
                            {res.description || 'Global resource provided by the District Executive.'}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={16} className="color-gold-400" />
                                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--clr-text-muted)' }}>{res.file_type}</span>
                            </div>
                            <a 
                                href={`/storage/${res.file_path}`} 
                                target="_blank" 
                                className="btn btn--primary btn--sm"
                                style={{ height: '36px' }}
                            >
                                <Download size={14} className="mr-2" /> Download
                            </a>
                        </div>
                    </div>
                ))}
                
                {filteredResources.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', opacity: 0.3 }}>
                        <FolderOpen size={48} className="mx-auto mb-4 opacity-20" />
                        <h3>No Resources Found</h3>
                        <p>The District has not shared any manuals matching your search yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
