import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Book, Plus, Upload, Trash2, FileText, Download, Folder, Trash, Info } from 'lucide-react';

export default function DistrictResourceManager({ resources = [], readonly }) {
    const [view, setView] = useState('list'); // list, upload

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        category: 'Manuals',
        description: '',
        file: null,
    });

    const categories = ['Manuals', 'Songbooks', 'Curriculum', 'Policies', 'Promotional'];

    const handleUpload = (e) => {
        e.preventDefault();
        post(route('district_resources.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setView('list');
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this resource? It will be removed for all clubs.')) {
            router.delete(route('district_resources.destroy', id));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#fff' }}>District Resource Library</h3>
                    <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Central vault for all training materials and manuals.</p>
                </div>
                {!readonly && view === 'list' && (
                    <button className="btn btn--primary btn--sm" onClick={() => setView('upload')}>
                        <Plus size={16} className="mr-2" /> Upload New File
                    </button>
                )}
            </div>

            {view === 'upload' ? (
                <div className="panel slide-in">
                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3>Upload Resource</h3>
                        
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Resource Title</label>
                                <input className="h-input" value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Pathfinder Staff Manual 2026" />
                                {errors.title && <div className="field-error">{errors.title}</div>}
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="h-select" value={data.category} onChange={e => setData('category', e.target.value)}>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description (Optional)</label>
                            <textarea className="h-textarea" value={data.description} onChange={e => setData('description', e.target.value)} rows={2} placeholder="What is this file for?..." />
                        </div>

                        <div className="form-group">
                            <label>File (Large Support up to 100MB)</label>
                            <div style={{ 
                                height: '120px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.01)'
                            }}>
                                <input 
                                    type="file" 
                                    onChange={e => setData('file', e.target.files[0])}
                                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }}
                                />
                                {data.file ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <FileText size={24} className="mx-auto mb-1 color-gold-400" />
                                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{data.file.name}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--clr-text-muted)' }}>{(data.file.size / (1024 * 1024)).toFixed(2)} MB</div>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={24} className="mb-2 opacity-30" />
                                        <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Click or drag to select file</div>
                                    </>
                                )}
                            </div>
                            {errors.file && <div className="field-error">{errors.file}</div>}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button type="button" className="btn btn--secondary" onClick={() => setView('list')}>Cancel</button>
                            <button type="submit" className="btn btn--primary" disabled={processing}>
                                {processing ? 'Uploading Large File...' : 'Finish Upload'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {resources.map(res => (
                        <div key={res.id} className="panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--clr-burgundy-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                        <Book size={20} />
                                    </div>
                                    <div>
                                        <div className="badge badge--neutral" style={{ fontSize: '9px', marginBottom: '4px' }}>{res.category}</div>
                                        <h4 style={{ margin: 0, fontSize: '15px' }}>{res.title}</h4>
                                    </div>
                                </div>
                                {!readonly && (
                                    <button onClick={() => handleDelete(res.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <div style={{ padding: '20px' }}>
                                <p style={{ fontSize: '12px', color: 'var(--clr-text-secondary)', marginBottom: '20px', minHeight: '36px' }}>
                                    {res.description || 'No description provided.'}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--clr-text-muted)', fontWeight: 800 }}>{res.file_type} FILE</span>
                                        <span style={{ fontSize: '11px', color: '#fff' }}>{res.file_size}</span>
                                    </div>
                                    <a 
                                        href={`/storage/${res.file_path}`} 
                                        target="_blank" 
                                        className="btn btn--secondary btn--sm" 
                                        style={{ height: '32px', padding: '0 12px' }}
                                    >
                                        <Download size={14} className="mr-2" /> Download
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                    {resources.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: '80px', textAlign: 'center', opacity: 0.3 }}>
                            <Folder size={48} className="mx-auto mb-4 opacity-20" />
                            <h3>Library is empty</h3>
                            <p>Start by uploading manuals or curriculum for your district.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
