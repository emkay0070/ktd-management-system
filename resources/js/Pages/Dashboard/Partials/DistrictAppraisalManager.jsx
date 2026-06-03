import { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { ClipboardCheck, Search, Plus, Trophy, Trash2, Calendar, FileText, CheckCircle } from 'lucide-react';

export default function DistrictAppraisalManager({ churches = [], appraisals = [] }) {
    const [view, setView] = useState('list'); // list, create
    const [searchTerm, setSearchTerm] = useState('');

    const currentYear = new Date().getFullYear();
    const currentQuarter = useMemo(() => {
        const month = new Date().getMonth();
        if (month < 3) return 'Q1';
        if (month < 6) return 'Q2';
        if (month < 9) return 'Q3';
        return 'Q4';
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm({
        church_id: '',
        quarter: currentQuarter,
        year: currentYear,
        score_technical: 0,
        score_admin: 0,
        score_activities: 0,
        comments: '',
    });

    const filteredChurches = useMemo(() => {
        return churches.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [churches, searchTerm]);

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('district_appraisals.store'), {
            onSuccess: () => {
                reset();
                setView('list');
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to remove this appraisal?')) {
            router.delete(route('district_appraisals.destroy', id));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ margin: 0, color: 'var(--clr-text-primary)' }}>Club Performance Appraisals</h3>
                    <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Formally grade clubs across technical, admin, and activity rubrics.</p>
                </div>
                {view === 'list' && (
                    <button className="btn btn--primary btn--sm" onClick={() => setView('create')}>
                        <Plus size={16} className="mr-2" /> New Appraisal
                    </button>
                )}
            </div>

            {view === 'create' ? (
                <div className="panel slide-in">
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ padding: '8px', background: 'var(--clr-burgundy-500)', borderRadius: '8px', color: '#fff' }}>
                                <ClipboardCheck size={20} />
                            </div>
                            <h3>Club Appraisal Scoresheet</h3>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Select Local Club</label>
                                <select className="h-select" value={data.church_id} onChange={e => setData('church_id', e.target.value)} required>
                                    <option value="">-- Select a Church --</option>
                                    {churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Quarter</label>
                                    <select className="h-select" value={data.quarter} onChange={e => setData('quarter', e.target.value)}>
                                        <option value="Q1">Q1 (Jan-Mar)</option>
                                        <option value="Q2">Q2 (Apr-Jun)</option>
                                        <option value="Q3">Q3 (Jul-Sep)</option>
                                        <option value="Q4">Q4 (Oct-Dec)</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Year</label>
                                    <input type="number" className="h-input" value={data.year} onChange={e => setData('year', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: '10px 0' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                            <div className="form-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Technical & Discipline</span>
                                    <b style={{ color: 'var(--clr-gold-400)' }}>{data.score_technical} / 30</b>
                                </label>
                                <p style={{ fontSize: '10px', color: 'var(--clr-text-muted)', marginBottom: '8px' }}>Uniformity, Drills, Marching, Salute.</p>
                                <input type="range" min="0" max="30" step="1" className="h-range" value={data.score_technical} onChange={e => setData('score_technical', parseInt(e.target.value))} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Administration</span>
                                    <b style={{ color: 'var(--clr-gold-400)' }}>{data.score_admin} / 30</b>
                                </label>
                                <p style={{ fontSize: '10px', color: 'var(--clr-text-muted)', marginBottom: '8px' }}>Reporting, Register, Treasury, Communication.</p>
                                <input type="range" min="0" max="30" step="1" className="h-range" value={data.score_admin} onChange={e => setData('score_admin', parseInt(e.target.value))} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Activities & Evangelism (Incl. Tasks)</span>
                                    <b style={{ color: 'var(--clr-gold-400)' }}>{data.score_activities} / 40</b>
                                </label>
                                <p style={{ fontSize: '10px', color: 'var(--clr-text-muted)', marginBottom: '8px' }}>Task Missions, Outreaches, Campouts.</p>
                                <input type="range" min="0" max="40" step="1" className="h-range" value={data.score_activities} onChange={e => setData('score_activities', parseInt(e.target.value))} />
                            </div>
                        </div>

                        <div style={{ padding: '20px', background: 'rgba(212, 160, 23, 0.05)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(212, 160, 23, 0.1)' }}>
                            <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--clr-gold-400)', marginBottom: '4px' }}>Computed Total Score</div>
                            <div style={{ fontSize: '42px', fontWeight: 900, color: 'var(--clr-text-primary)' }}>
                                {data.score_technical + data.score_admin + data.score_activities}
                                <span style={{ fontSize: '18px', opacity: 0.5, fontWeight: 500 }}> / 100</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>General Comments & Feedback</label>
                            <textarea className="h-textarea" rows={2} value={data.comments} onChange={e => setData('comments', e.target.value)} placeholder="Provide constructive feedback for the club..." />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn--secondary" onClick={() => setView('list')}>Cancel</button>
                            <button type="submit" className="btn btn--primary" disabled={processing}>
                                <CheckCircle size={16} className="mr-2" /> Submit Appraisal
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="panel p-0">
                    <div className="table-responsive">
                    <table className="h-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '24px' }}>Period</th>
                                <th>Local Club</th>
                                <th>Score Distribution (T | A | Act)</th>
                                <th>Total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appraisals.map(app => (
                                <tr key={app.id}>
                                    <td style={{ paddingLeft: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={14} className="color-gold-400" />
                                            <b>{app.quarter} {app.year}</b>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 800, color: 'var(--clr-text-primary)' }}>{app.church?.name}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px', fontSize: '11px', color: 'var(--clr-text-secondary)' }}>
                                            <span style={{ fontWeight: 700, color: 'var(--clr-text-primary)' }}>{app.score_technical}</span> / 30 | 
                                            <span style={{ fontWeight: 700, color: 'var(--clr-text-primary)' }}>{app.score_admin}</span> / 30 | 
                                            <span style={{ fontWeight: 700, color: 'var(--clr-text-primary)' }}>{app.score_activities}</span> / 40
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--clr-gold-400)' }}>{app.total_score}</div>
                                            <Trophy size={14} className="opacity-30" />
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                        <button onClick={() => handleDelete(app.id)} className="icon-btn" style={{ color: 'var(--clr-burgundy-400)' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {appraisals.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '60px', textAlign: 'center', opacity: 0.3 }}>
                                        <ClipboardCheck size={40} className="mx-auto mb-4" />
                                        <p>No appraisals recorded for this year yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}
        </div>
    );
}
