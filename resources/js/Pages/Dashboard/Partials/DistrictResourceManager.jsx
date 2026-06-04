import { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Book, Plus, Upload, Trash2, FileText, Download, Folder, Trash, Info, Search, Filter, LayoutGrid, List, File, Image, Film, Music, Clock, User } from 'lucide-react';

export default function DistrictResourceManager({ resources = [], readonly }) {
    const [view, setView] = useState('list'); // list, upload
    const [layout, setLayout] = useState('grid'); // grid, table
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [deptFilter, setDeptFilter] = useState('All');

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        category: 'Manuals',
        department: 'General',
        description: '',
        file: null,
    });

    const categories = ['Manuals', 'Songbooks', 'Curriculum', 'Policies', 'Promotional', 'Forms', 'Other'];
    const departments = ['General', 'Pathfinders', 'Adventurers', 'Master Guides', 'PBE', 'Music', 'Communication', 'Treasury'];

    const filteredResources = useMemo(() => {
        return resources.filter(res => {
            const matchesSearch = res.title.toLowerCase().includes(search.toLowerCase()) || 
                                 res.description?.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || res.category === categoryFilter;
            const matchesDept = deptFilter === 'All' || res.department === deptFilter;
            return matchesSearch && matchesCategory && matchesDept;
        });
    }, [resources, search, categoryFilter, deptFilter]);

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

    const getFileIcon = (type) => {
        const t = type?.toLowerCase() || '';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(t)) return <Image size={20} />;
        if (['mp4', 'mov', 'avi'].includes(t)) return <Film size={20} />;
        if (['mp3', 'wav'].includes(t)) return <Music size={20} />;
        if (['pdf', 'doc', 'docx', 'txt'].includes(t)) return <FileText size={20} />;
        return <File size={20} />;
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-white flex items-center gap-2">
                        <Folder className="text-gold-400" size={24} />
                        District Resource Library
                    </h3>
                    <p className="text-xs text-gray-500">Central vault for all training materials, manuals, and departmental resources.</p>
                </div>
                {!readonly && view === 'list' && (
                    <button className="btn btn--primary btn--sm" onClick={() => setView('upload')}>
                        <Plus size={16} className="mr-2" /> Add Resource
                    </button>
                )}
                {view === 'upload' && (
                    <button className="btn btn--secondary btn--sm" onClick={() => setView('list')}>
                        Back to Library
                    </button>
                )}
            </div>

            {view === 'upload' ? (
                <div className="panel slide-in overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                        <h4 className="text-white font-bold">Upload New Resource</h4>
                        <p className="text-xs text-gray-500">Files uploaded here are instantly available to all club directors in the district.</p>
                    </div>
                    <form onSubmit={handleUpload} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="form-group md:col-span-1">
                                <label>Title</label>
                                <input className="h-input" value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Camporee Guide 2026" />
                                {errors.title && <div className="field-error">{errors.title}</div>}
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="h-select" value={data.category} onChange={e => setData('category', e.target.value)}>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <select className="h-select" value={data.department} onChange={e => setData('department', e.target.value)}>
                                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description (Optional)</label>
                            <textarea className="h-textarea" value={data.description} onChange={e => setData('description', e.target.value)} rows={2} placeholder="Briefly describe what this resource contains..." />
                        </div>

                        <div className="form-group">
                            <label>File Attachment (Max 100MB)</label>
                            <div className={`relative h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${data.file ? 'border-gold-500/50 bg-gold-500/5' : 'border-white/10 bg-white/[0.01] hover:border-white/20'}`}>
                                <input 
                                    type="file" 
                                    onChange={e => setData('file', e.target.files[0])}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                {data.file ? (
                                    <div className="text-center">
                                        <div className="w-10 h-10 bg-gold-500/20 text-gold-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                                            {getFileIcon(data.file.name.split('.').pop())}
                                        </div>
                                        <div className="text-xs font-bold text-white">{data.file.name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{(data.file.size / (1024 * 1024)).toFixed(2)} MB</div>
                                    </div>
                                ) : (
                                    <div className="text-center opacity-40">
                                        <Upload size={32} className="mx-auto mb-2" />
                                        <div className="text-xs font-bold uppercase tracking-widest">Select File to Upload</div>
                                    </div>
                                )}
                            </div>
                            {errors.file && <div className="field-error">{errors.file}</div>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" className="btn btn--ghost" onClick={() => setView('list')}>Cancel</button>
                            <button type="submit" className="btn btn--primary" disabled={processing}>
                                {processing ? 'Uploading...' : 'Publish Resource'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Filters & Search */}
                    <div className="panel p-4 flex flex-wrap items-center justify-between gap-4 bg-white/[0.01]">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="Search resources..." 
                                    className="h-input pl-10 h-9 text-xs w-48 md:w-64"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
                                <Filter size={12} className="ml-2 text-gray-500" />
                                <select className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-gray-400 focus:ring-0 cursor-pointer" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                                    <option value="All">All Categories</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <div className="w-px h-4 bg-white/10"></div>
                                <select className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-gray-400 focus:ring-0 cursor-pointer" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                                    <option value="All">All Departments</option>
                                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-lg">
                            <button onClick={() => setLayout('grid')} className={`p-1.5 rounded-md transition-all ${layout === 'grid' ? 'bg-white/10 text-gold-400' : 'text-gray-500 hover:text-white'}`}>
                                <LayoutGrid size={16} />
                            </button>
                            <button onClick={() => setLayout('table')} className={`p-1.5 rounded-md transition-all ${layout === 'table' ? 'bg-white/10 text-gold-400' : 'text-gray-500 hover:text-white'}`}>
                                <List size={16} />
                            </button>
                        </div>
                    </div>

                    {layout === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredResources.map(res => (
                                <div key={res.id} className="panel p-0 overflow-hidden border border-white/5 group hover:border-gold-500/30 transition-all">
                                    <div className="p-5 bg-white/[0.02] border-b border-white/5 flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-burgundy-500/10 text-burgundy-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                {getFileIcon(res.file_type)}
                                            </div>
                                            <div>
                                                <div className="flex gap-2 mb-1">
                                                    <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 text-gray-400">{res.category}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-500">{res.department}</span>
                                                </div>
                                                <h4 className="text-white font-bold leading-tight">{res.title}</h4>
                                            </div>
                                        </div>
                                        {!readonly && (
                                            <button onClick={() => handleDelete(res.id)} className="opacity-0 group-hover:opacity-100 p-2 text-danger-400 hover:bg-danger-500/10 rounded-lg transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">{res.description || 'No description provided.'}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">{res.file_type}</span>
                                                    <span className="text-[10px] font-bold text-white">{res.file_size}</span>
                                                </div>
                                            </div>
                                            <a href={`/storage/${res.file_path}`} target="_blank" className="btn btn--secondary btn--sm">
                                                <Download size={14} className="mr-2" /> Get File
                                            </a>
                                        </div>
                                        {res.uploader && (
                                            <div className="mt-4 flex items-center gap-2 text-[9px] text-gray-600 uppercase font-black">
                                                <User size={10} /> {res.uploader.name} • {new Date(res.created_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="panel p-0 overflow-hidden border border-white/5">
                            <div className="table-responsive">
                                <table className="h-table">
                                    <thead>
                                        <tr>
                                            <th>Resource Name</th>
                                            <th>Category</th>
                                            <th>Department</th>
                                            <th>Size</th>
                                            <th>Uploader</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredResources.map(res => (
                                            <tr key={res.id}>
                                                <td className="cell-primary font-bold">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-burgundy-400">{getFileIcon(res.file_type)}</div>
                                                        {res.title}
                                                    </div>
                                                </td>
                                                <td><span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-gray-400">{res.category}</span></td>
                                                <td><span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-gold-500/10 text-gold-500">{res.department}</span></td>
                                                <td>{res.file_size}</td>
                                                <td>
                                                    <div className="text-xs font-bold text-gray-300">{res.uploader?.name || 'Unknown'}</div>
                                                    <div className="text-[9px] text-gray-600 uppercase">{new Date(res.created_at).toLocaleDateString()}</div>
                                                </td>
                                                <td className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <a href={`/storage/${res.file_path}`} target="_blank" className="btn btn--sm btn--ghost" title="Download">
                                                            <Download size={14} />
                                                        </a>
                                                        {!readonly && (
                                                            <button onClick={() => handleDelete(res.id)} className="btn btn--sm btn--ghost text-danger-400" title="Delete">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {filteredResources.length === 0 && (
                        <div className="panel p-20 text-center bg-white/[0.01]">
                            <Folder size={48} className="mx-auto mb-4 opacity-10" />
                            <h4 className="text-gray-500 font-bold uppercase tracking-widest">No matching resources</h4>
                            <p className="text-xs text-gray-600">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
