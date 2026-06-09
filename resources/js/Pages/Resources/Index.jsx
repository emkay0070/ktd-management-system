import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Search, Filter, Download, Upload, FileText, 
    Image as ImageIcon, Book, Shield, Zap, Star, 
    Plus, X, MoreVertical, Folder
} from 'lucide-react';

export default function Index({ auth, resources, filters }) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'All');

    const categories = ['All', 'Honors', 'Manuals', 'Leadership', 'Camping', 'Drill', 'Music', 'General'];

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        description: '',
        file: null,
        thumbnail: null,
        category: 'General',
        visibility: 'union',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('resources.index'), { search, category: selectedCategory }, { preserveState: true });
    };

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        router.get(route('resources.index'), { search, category: cat }, { preserveState: true });
    };

    const handleUpload = (e) => {
        e.preventDefault();
        post(route('resources.store'), {
            onSuccess: () => {
                reset();
                setIsUploadModalOpen(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Ministry Library & Marketplace</h2>}
        >
            <Head title="Ministry Library" />

            <div className="max-w-7xl mx-auto py-10 px-6 lg:px-8">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Resource Center</h1>
                        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-black">Official Manuals, Honors & Ministry Tools</p>
                    </div>
                    
                    <button 
                        onClick={() => setIsUploadModalOpen(true)}
                        className="btn btn--primary flex items-center gap-2 px-6"
                    >
                        <Plus size={20} />
                        Upload Resource
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input 
                                type="text" 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by title, description, or keyword..." 
                                className="w-full bg-[#16161d] border-white/5 rounded-2xl pl-12 py-4 text-white focus:ring-burgundy-500 placeholder:text-gray-600 shadow-xl"
                            />
                        </form>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-4 bg-[#16161d] border border-white/5 rounded-2xl flex items-center gap-3 flex-1">
                            <Filter size={20} className="text-burgundy-400" />
                            <select 
                                value={selectedCategory}
                                onChange={e => handleCategoryChange(e.target.value)}
                                className="bg-transparent border-none text-white text-sm focus:ring-0 p-0 w-full font-bold uppercase tracking-widest"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat} className="bg-[#16161d]">{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Resource Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {resources.data.map(resource => (
                        <div key={resource.id} className="panel group border-white/5 bg-[#16161d] overflow-hidden flex flex-col hover:border-burgundy-500/30 transition-all shadow-xl">
                            {/* Thumbnail */}
                            <div className="aspect-video bg-black/40 relative overflow-hidden">
                                {resource.thumbnail_url ? (
                                    <img src={resource.thumbnail_url} alt={resource.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-800">
                                        <Folder size={64} />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] text-burgundy-400 font-black uppercase tracking-widest border border-burgundy-500/20">
                                        {resource.category}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{resource.title}</h3>
                                <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-1">{resource.description}</p>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-burgundy-900/30 flex items-center justify-center text-burgundy-400 text-[8px] font-black uppercase border border-burgundy-500/20">
                                            {resource.uploader?.name.substring(0, 2)}
                                        </div>
                                        <span className="text-[10px] text-gray-600 uppercase font-black">{resource.uploader?.name}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-600 uppercase font-black flex items-center gap-1">
                                        <Download size={10} /> {resource.downloads_count}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 bg-black/20 flex gap-2">
                                <a 
                                    href={route('resources.download', resource.id)}
                                    className="btn btn--primary btn--sm flex-1 flex items-center justify-center gap-2"
                                >
                                    <Download size={14} />
                                    {resource.price > 0 ? `Buy for $${resource.price}` : 'Download Free'}
                                </a>
                                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500">
                                    <Star size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {resources.data.length === 0 && (
                    <div className="text-center py-40 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <Book size={64} className="mx-auto text-gray-800 mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">No resources found</h2>
                        <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-xl panel border-white/10 bg-[#16161d] shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">Upload New Resource</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-black mt-1">Share knowledge with the Union</p>
                            </div>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpload} className="p-8 space-y-6">
                            <div className="form-group">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Resource Title</label>
                                <input 
                                    type="text" 
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="h-input w-full" 
                                    placeholder="e.g. Master Guide Curriculum 2026"
                                />
                                {errors.title && <div className="text-red-500 text-[10px] mt-1 uppercase font-black">{errors.title}</div>}
                            </div>

                            <div className="form-group">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Description</label>
                                <textarea 
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="h-input w-full h-24 py-3" 
                                    placeholder="Briefly describe what this resource contains..."
                                />
                                {errors.description && <div className="text-red-500 text-[10px] mt-1 uppercase font-black">{errors.description}</div>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Category</label>
                                    <select 
                                        value={data.category}
                                        onChange={e => setData('category', e.target.value)}
                                        className="h-input w-full"
                                    >
                                        {categories.filter(c => c !== 'All').map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Visibility</label>
                                    <select 
                                        value={data.visibility}
                                        onChange={e => setData('visibility', e.target.value)}
                                        className="h-input w-full"
                                    >
                                        <option value="public">Public (Everyone)</option>
                                        <option value="union">Union Wide</option>
                                        <option value="district">District Only</option>
                                        <option value="staff_only">Staff Only</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Resource File</label>
                                    <input 
                                        type="file" 
                                        onChange={e => setData('file', e.target.files[0])}
                                        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-burgundy-900/30 file:text-burgundy-400 hover:file:bg-burgundy-900/50"
                                    />
                                    {errors.file && <div className="text-red-500 text-[10px] mt-1 uppercase font-black">{errors.file}</div>}
                                </div>
                                <div className="form-group">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Thumbnail (Optional)</label>
                                    <input 
                                        type="file" 
                                        onChange={e => setData('thumbnail', e.target.files[0])}
                                        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-white/5 file:text-gray-400 hover:file:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="btn btn--secondary">Cancel</button>
                                <button type="submit" disabled={processing} className="btn btn--primary px-8">
                                    {processing ? 'Uploading...' : 'Publish Resource'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
