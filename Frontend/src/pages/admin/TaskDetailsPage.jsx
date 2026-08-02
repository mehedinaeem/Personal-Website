import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tasksApi } from '../../api';
import { Button, Card, PageLoader, Textarea, Input } from '../../components/ui';
import { labelFor, pageResults } from './taskOptions';

const TaskDetailsPage = ({ logsOnly = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [logForm, setLogForm] = useState({ progress_after: 0, work_completed: '', blocker: '', next_step: '', minutes_spent: 0, allow_progress_decrease: false });

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const [taskData, logData] = await Promise.all([tasksApi.get(id), tasksApi.getLogs(id)]);
            setTask(taskData); setLogs(pageResults(logData));
            setLogForm((current) => ({ ...current, progress_after: taskData.progress_percentage }));
        } catch (requestError) { setError(requestError.displayMessage || 'Could not load task.'); }
        finally { setLoading(false); }
    }, [id]);
    useEffect(() => { load(); }, [load]);

    const addLog = async (event) => {
        event.preventDefault();
        try {
            await tasksApi.addLog(id, { ...logForm, progress_after: Number(logForm.progress_after), minutes_spent: Number(logForm.minutes_spent) });
            toast.success('Progress logged'); load();
        } catch (requestError) { toast.error(requestError.displayMessage || 'Could not add log.'); }
    };
    const complete = async () => { await tasksApi.complete(id); toast.success('Task completed'); load(); };
    const remove = async () => { if (!window.confirm(`Delete “${task.title}”?`)) return; await tasksApi.delete(id); navigate('/admin/tasks'); };

    if (loading) return <PageLoader />;
    if (error) return <div role="alert" className="p-4 bg-red-50 text-red-700 rounded-xl">{error} <button onClick={load} className="underline">Retry</button></div>;
    return <div className="max-w-5xl mx-auto space-y-6">
        {!logsOnly && <><div className="flex flex-col sm:flex-row justify-between gap-4"><div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">{task.title}</h1><p className="text-gray-500">{labelFor(task.area)} · {labelFor(task.priority)} · {labelFor(task.status)}</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" to={`/admin/tasks/${id}/edit`}>Edit</Button>{task.status !== 'completed' && <Button onClick={complete}>Complete</Button>}<Button variant="danger" onClick={remove}>Delete</Button></div></div>
        <Card hover={false}><p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{task.description || 'No description.'}</p><div className="mt-5 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" role="progressbar" aria-label="Task progress" aria-valuenow={task.progress_percentage} aria-valuemin="0" aria-valuemax="100"><div className="h-full bg-sky-500" style={{ width: `${task.progress_percentage}%` }} /></div><div className="mt-2 flex justify-between text-sm text-gray-500"><span>{task.progress_percentage}% complete</span><span>{task.actual_minutes} / {task.estimated_minutes} minutes</span></div>{task.due_at && <p className="mt-4"><strong>Due:</strong> {new Date(task.due_at).toLocaleString()}</p>}{task.next_action && <p className="mt-2"><strong>Next:</strong> {task.next_action}</p>}</Card></>}
        <Card hover={false}><h2 className="text-xl font-semibold mb-4">Add Progress Log</h2><form onSubmit={addLog} className="space-y-3"><div className="grid sm:grid-cols-2 gap-4"><Input label="Progress after" name="progress_after" type="number" min="0" max="100" value={logForm.progress_after} onChange={(e) => setLogForm({ ...logForm, progress_after: e.target.value })} required /><Input label="Minutes spent" name="minutes_spent" type="number" min="0" value={logForm.minutes_spent} onChange={(e) => setLogForm({ ...logForm, minutes_spent: e.target.value })} /></div><Textarea label="Work completed" name="work_completed" value={logForm.work_completed} onChange={(e) => setLogForm({ ...logForm, work_completed: e.target.value })} /><Textarea label="Blocker" name="blocker" value={logForm.blocker} onChange={(e) => setLogForm({ ...logForm, blocker: e.target.value })} /><Textarea label="Next step" name="next_step" value={logForm.next_step} onChange={(e) => setLogForm({ ...logForm, next_step: e.target.value })} /><label className="flex gap-2 items-center"><input type="checkbox" checked={logForm.allow_progress_decrease} onChange={(e) => setLogForm({ ...logForm, allow_progress_decrease: e.target.checked })} /> Explicitly allow progress decrease</label><Button type="submit">Save Log</Button></form></Card>
        <section><h2 className="text-xl font-semibold mb-3">Progress Logs</h2>{logs.length === 0 ? <Card hover={false}><p className="text-gray-500">No progress has been logged.</p></Card> : <div className="space-y-3">{logs.map((log) => <Card hover={false} key={log.id} className="p-4"><div className="flex justify-between gap-3"><strong>{log.progress_before}% → {log.progress_after}%</strong><span className="text-sm text-gray-500">{log.log_date} · {log.minutes_spent} min</span></div>{log.work_completed && <p className="mt-2">{log.work_completed}</p>}{log.blocker && <p className="text-red-600 mt-1">Blocker: {log.blocker}</p>}</Card>)}</div>}</section>
    </div>;
};

export default TaskDetailsPage;
