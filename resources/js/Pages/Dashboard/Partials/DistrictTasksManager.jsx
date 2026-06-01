import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Trophy, Plus, ClipboardList, CheckCircle, XCircle, Clock, Image as ImageIcon, Send, MessageSquare } from 'lucide-react';

export default function DistrictTasksManager({ tasks, leaderboard, readonly }) {
    const [activeTab, setActiveTab] = useState('missions'); // missions, submissions, leaderboard
    const [view, setView] = useState('list'); // list, form, review
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        points: 10,
        deadline: '',
        quarter: 'Q1',
    });

    const reviewForm = useForm({
        status: 'Approved',
        feedback: '',
        points_awarded: 10,
    });

    const handleSubmitTask = (e) => {
        e.preventDefault();
        post(route('district_tasks.store'), {
            onSuccess: () => {
                reset();
                setView('list');
            }
        });
    };

    const handleReview = (e) => {
        e.preventDefault();
        router.post(route('district_tasks.review', selectedSubmission.id), reviewForm.data, {
            onSuccess: () => {
                setView('list');
                setSelectedSubmission(null);
            }
        });
    };

    const handleDeleteTask = (task) => {
        if (confirm(`Are you sure you want to delete this mission? This will remove all club submissions for it.`)) {
            router.delete(route('district_tasks.destroy', task.id));
        }
    };

    const allSubmissions = tasks.flatMap(task => 
        (task.submissions || []).map(sub => ({ ...sub, task_title: task.title, max_points: task.points }))
    ).filter(sub => sub.status === 'Pending Review');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
                <button 
                    onClick={() => setActiveTab('missions')}
                    className={`btn btn--sm ${activeTab === 'missions' ? 'btn--primary' : 'btn--ghost'}`}
                >
                    <ClipboardList size={16} className="mr-2" /> Active Missions
                </button>
                <button 
                    onClick={() => setActiveTab('submissions')}
                    className={`btn btn--sm ${activeTab === 'submissions' ? 'btn--primary' : 'btn--ghost'} relative`}
                >
                    <Send size={16} className="mr-2" /> 
                    Submissions Inbox
                    {allSubmissions.length > 0 && (
                        <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--clr-burgundy-500)', color: '#fff', fontSize: '10px', height: '18px', width: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                            {allSubmissions.length}
                        </span>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('leaderboard')}
                    className={`btn btn--sm ${activeTab === 'leaderboard' ? 'btn--primary' : 'btn--ghost'}`}
                >
                    <Trophy size={16} className="mr-2" /> Leaderboard
                </button>
            </div>

            {activeTab === 'missions' && (
                <div className="fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--clr-text-primary)' }}>Club Missions</h3>
                            <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Tasks assigned to clubs for points.</p>
                        </div>
                        {!readonly && view === 'list' && (
                            <button className="btn btn--primary btn--sm" onClick={() => setView('form')}>
                                <Plus size={16} className="mr-2" /> Post New Mission
                            </button>
                        )}
                    </div>

                    {view === 'list' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {tasks.map(task => (
                                <div key={task.id} className="panel" style={{ position: 'relative', padding: 'var(--sp-8)' }}>
                                    {!readonly && (
                                        <button 
                                            onClick={() => handleDeleteTask(task)}
                                            style={{ position: 'absolute', top: '16px', right: '16px', color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <div className="badge badge--gold">{task.points} Points</div>
                                        <div className="badge badge--neutral" style={{ textTransform: 'uppercase' }}>{task.quarter}</div>
                                    </div>
                                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--clr-text-primary)' }}>{task.title}</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--clr-text-secondary)', marginBottom: '16px', minHeight: '40px' }}>{task.description}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--clr-text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                                        <Clock size={14} />
                                        Deadline: {new Date(task.deadline).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="panel slide-in">
                            <form onSubmit={handleSubmitTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <h3>Create Quarter Mission</h3>
                                <div className="form-group">
                                    <label>Task Title</label>
                                    <input className="h-input" value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Upload church choir service photo" />
                                </div>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Points to Award</label>
                                        <input type="number" className="h-input" value={data.points} onChange={e => setData('points', e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Target Quarter</label>
                                        <select className="h-select" value={data.quarter} onChange={e => setData('quarter', e.target.value)}>
                                            <option value="Q1">Q1 (Jan - Mar)</option>
                                            <option value="Q2">Q2 (Apr - Jun)</option>
                                            <option value="Q3">Q3 (Jul - Sep)</option>
                                            <option value="Q4">Q4 (Oct - Dec)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Deadline</label>
                                    <input type="date" className="h-input" value={data.deadline} onChange={e => setData('deadline', e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Detailed Instructions</label>
                                    <textarea className="h-textarea" value={data.description} onChange={e => setData('description', e.target.value)} rows={3} placeholder="Explain exactly what the club director needs to upload..." />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn--secondary" onClick={() => setView('list')}>Cancel</button>
                                    <button type="submit" className="btn btn--primary" disabled={processing}>Post Mission</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'submissions' && (
                <div className="fade-in">
                    <h3 style={{ marginBottom: '16px', color: 'var(--clr-text-primary)' }}>Evidence Submissions</h3>
                    
                    {view === 'review' ? (
                        <div className="panel slide-in">
                            <div className="form-grid-2">
                                <div>
                                    <h4 style={{ color: 'var(--clr-gold-400)', marginBottom: '12px' }}>Evidence Provided</h4>
                                    <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <img src={`/storage/${selectedSubmission.evidence_path}`} alt="Evidence" style={{ width: '100%', display: 'block' }} />
                                    </div>
                                </div>
                                <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>Mission Review</h4>
                                        <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{selectedSubmission.task_title} from {selectedSubmission.church?.name}</p>
                                    </div>
                                    <div className="form-group">
                                        <label>Decision</label>
                                        <select className="h-select" value={reviewForm.data.status} onChange={e => reviewForm.setData('status', e.target.value)}>
                                            <option value="Approved">Approve & Award Points</option>
                                            <option value="Rejected">Reject Submission</option>
                                        </select>
                                    </div>
                                    {reviewForm.data.status === 'Approved' && (
                                        <div className="form-group">
                                            <label>Points to Award (Max {selectedSubmission.max_points})</label>
                                            <input type="number" className="h-input" value={reviewForm.data.points_awarded} onChange={e => reviewForm.setData('points_awarded', e.target.value)} />
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Feedback to Club Director</label>
                                        <textarea className="h-textarea" value={reviewForm.data.feedback} onChange={e => reviewForm.setData('feedback', e.target.value)} placeholder="Well done! / Photo was blurred, please re-upload..." />
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                                        <button type="button" className="btn btn--secondary" onClick={() => setView('list')}>Back</button>
                                        <button type="submit" className="btn btn--primary">Submit Review</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="panel p-0">
                            <div className="table-responsive">
                            <table className="h-table">
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: '24px' }}>Club / Church</th>
                                        <th>Target Mission</th>
                                        <th>Date Submitted</th>
                                        <th style={{ width: 100 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allSubmissions.map(sub => (
                                        <tr key={sub.id}>
                                            <td style={{ paddingLeft: '24px' }}>
                                                <div style={{ fontWeight: 800, color: 'var(--clr-text-primary)' }}>{sub.church?.name}</div>
                                            </td>
                                            <td>{sub.task_title}</td>
                                            <td style={{ color: 'var(--clr-text-muted)', fontSize: '12px' }}>{new Date(sub.created_at).toLocaleString()}</td>
                                            <td>
                                                <button 
                                                    className="btn btn--sm btn--primary"
                                                    onClick={() => {
                                                        setSelectedSubmission(sub);
                                                        reviewForm.setData('points_awarded', sub.max_points);
                                                        setView('review');
                                                    }}
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {allSubmissions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '60px', textAlign: 'center', opacity: 0.5 }}>
                                                <ImageIcon size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                                <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>Inbox Clear</div>
                                                <p style={{ fontSize: '12px' }}>No pending missions to review right now.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'leaderboard' && (
                <div className="fade-in">
                    <h3 style={{ marginBottom: '16px', color: 'var(--clr-text-primary)' }}>District Leaderboard</h3>
                    <div className="panel p-0">
                        <div className="table-responsive">
                        <table className="h-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 80, paddingLeft: '24px' }}>Rank</th>
                                    <th>Club Name</th>
                                    <th style={{ width: 200, textAlign: 'right', paddingRight: '24px' }}>Total Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry, index) => (
                                    <tr key={entry.id}>
                                        <td style={{ paddingLeft: '24px' }}>
                                            <div style={{ 
                                                height: '32px', width: '32px', borderRadius: '50%', 
                                                background: index === 0 ? 'var(--clr-gold-500)' : 'var(--clr-surface-600)',
                                                color: index === 0 ? '#000' : 'var(--clr-text-primary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900
                                            }}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 800, color: 'var(--clr-text-primary)' }}>{entry.name}</td>
                                        <td style={{ textAlign: 'right', paddingRight: '24px', fontWeight: 900, fontSize: '20px', color: 'var(--clr-gold-400)' }}>
                                            {entry.points}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
