import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Camera, CheckCircle, Clock, AlertCircle, Info, Upload } from 'lucide-react';

export default function ClubTasksManager({ tasks, readonly }) {
    const [selectedTask, setSelectedTask] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        district_task_id: '',
        evidence: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('club_tasks.submit'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setSelectedTask(null);
            }
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(212,160,23,0.1)', borderRadius: '10px', color: 'var(--clr-gold-400)' }}>
                    <Camera size={24} />
                </div>
                <div>
                    <h3 style={{ margin: 0, color: '#fff' }}>District Missions</h3>
                    <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Complete these tasks to earn points for your club.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {tasks.map(task => {
                    const hasSubmitted = !!task.user_submission;
                    const isApproved = task.user_submission?.status === 'Approved';
                    const isRejected = task.user_submission?.status === 'Rejected';
                    const isPending = task.user_submission?.status === 'Pending Review';

                    return (
                        <div key={task.id} className="panel flex flex-col" style={{ display: 'flex', flexDirection: 'column', border: isApproved ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div className="badge badge--gold">{task.points} Pts</div>
                                {hasSubmitted && (
                                    <div className={`badge ${isApproved ? 'badge--success' : isRejected ? 'badge--danger' : 'badge--info'}`}>
                                        {task.user_submission.status}
                                    </div>
                                )}
                            </div>

                            <h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>{task.title}</h4>
                            <p style={{ fontSize: '13px', color: 'var(--clr-text-secondary)', marginBottom: '16px', flexGrow: 1 }}>{task.description}</p>
                            
                            {isRejected && (
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <AlertCircle size={14} className="text-danger mt-0.5" />
                                    <div style={{ fontSize: '11px', color: 'var(--clr-burgundy-300)' }}>
                                        <strong>Reason:</strong> {task.user_submission.feedback}
                                    </div>
                                </div>
                            )}

                            {isApproved && (
                                <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <CheckCircle size={14} className="text-success mt-0.5" />
                                    <div style={{ fontSize: '11px', color: 'var(--clr-success-400)' }}>
                                        Points Awarded: <strong>{task.user_submission.points_awarded}</strong>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--clr-text-muted)', marginBottom: '16px' }}>
                                <Clock size={14} />
                                Deadline: {new Date(task.deadline).toLocaleDateString()}
                            </div>

                            {!hasSubmitted && !readonly && (
                                <button 
                                    className="btn btn--primary btn--sm" 
                                    style={{ width: '100%' }}
                                    onClick={() => {
                                        setData('district_task_id', task.id);
                                        setSelectedTask(task);
                                    }}
                                >
                                    <Upload size={14} className="mr-2" /> Submit Evidence
                                </button>
                            )}
                        </div>
                    );
                })}
                {tasks.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', opacity: 0.4, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                        <Info size={32} className="mx-auto mb-2" />
                        <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>No Active Missions</div>
                        <p style={{ fontSize: '12px' }}>The District has not posted any tasks for this quarter yet.</p>
                    </div>
                )}
            </div>

            {selectedTask && (
                <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="panel slide-in" style={{ maxWidth: '500px', width: '100%' }}>
                        <form onSubmit={handleSubmit}>
                            <h3 style={{ marginBottom: '8px' }}>Upload Mission Evidence</h3>
                            <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginBottom: '20px' }}>{selectedTask.title}</p>
                            
                            <div className="form-group">
                                <label>Attach Photo (Evidence)</label>
                                <div style={{ 
                                    height: '200px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.01)'
                                }}>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={e => setData('evidence', e.target.files[0])}
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }}
                                    />
                                    {data.evidence ? (
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--clr-gold-400)' }}>{data.evidence.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--clr-text-muted)' }}>Click to replace photo</div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={32} className="mb-2 opacity-30" />
                                            <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Drag or click to browse photos</div>
                                        </>
                                    )}
                                </div>
                                {errors.evidence && <div className="field-error">{errors.evidence}</div>}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn--secondary" onClick={() => setSelectedTask(null)}>Cancel</button>
                                <button type="submit" className="btn btn--primary" disabled={processing}>
                                    {processing ? 'Uploading...' : 'Send to District'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
