import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiPlus, HiExclamation } from 'react-icons/hi';
import { tasksApi } from '../../api';
import { Button, Card, PageLoader } from '../../components/ui';
import { areas, labelFor, pageResults, priorities, statuses, fieldClass } from './taskOptions';

const endpointMap = { today: 'getToday', upcoming: 'getUpcoming', overdue: 'getOverdue', all: 'getAll' };

const TasksPage = ({ view = 'all' }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ status: '', priority: '', area: '', search: '' });

    const loadTasks = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
            setTasks(pageResults(await tasksApi[endpointMap[view]](params)));
        } catch (requestError) {
            setError(requestError.displayMessage || 'Could not load tasks.');
        } finally {
            setLoading(false);
        }
    }, [filters, view]);

    useEffect(() => { loadTasks(); }, [loadTasks]);

    const removeTask = async (task) => {
        if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
        try {
            await tasksApi.delete(task.id);
            toast.success('Task deleted');
            loadTasks();
        } catch (requestError) {
            toast.error(requestError.displayMessage || 'Could not delete task.');
        }
    };

    if (loading) return <PageLoader />;
    const heading = view === 'today' ? 'Today' : view === 'all' ? 'All Tasks' : labelFor(view);

    return <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">{heading}</h1><p className="text-gray-500">Plan work and keep progress visible.</p></div>
            <Button to="/admin/tasks/new" icon={HiPlus}>Add Task</Button>
        </div>
        <Card hover={false} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="text-sm">Search<input aria-label="Search tasks" className={fieldClass} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></label>
            {[['status', statuses], ['priority', priorities], ['area', areas]].map(([name, options]) => <label key={name} className="text-sm">{labelFor(name)}<select className={fieldClass} value={filters[name]} onChange={(e) => setFilters({ ...filters, [name]: e.target.value })}><option value="">All</option>{options.map((item) => <option key={item} value={item}>{labelFor(item)}</option>)}</select></label>)}
        </Card>
        {error && <div role="alert" className="p-4 rounded-xl bg-red-50 text-red-700">{error} <button className="underline" onClick={loadTasks}>Retry</button></div>}
        {!error && tasks.length === 0 && <Card hover={false} className="text-center py-12"><p className="text-gray-500 mb-4">No tasks found.</p><Button to="/admin/tasks/new">Create your first task</Button></Card>}
        <div className="grid gap-4">
            {tasks.map((task) => {
                const overdue = task.due_at && new Date(task.due_at) < new Date() && !['completed', 'cancelled'].includes(task.status);
                return <Card key={task.id} hover={false} className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2"><Link className="text-lg font-semibold text-sky-600 hover:underline" to={`/admin/tasks/${task.id}`}>{task.title}</Link>{overdue && <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><HiExclamation /> Overdue</span>}</div>
                            <p className="text-sm text-gray-500">{labelFor(task.area)} · {labelFor(task.priority)} · {labelFor(task.status)}</p>
                            <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" role="progressbar" aria-label={`${task.title} progress`} aria-valuenow={task.progress_percentage} aria-valuemin="0" aria-valuemax="100"><div className="h-full bg-sky-500" style={{ width: `${task.progress_percentage}%` }} /></div>
                            <p className="text-xs text-gray-500 mt-1">{task.progress_percentage}% complete</p>
                        </div>
                        <div className="flex gap-2"><Button size="sm" variant="secondary" to={`/admin/tasks/${task.id}/edit`}>Edit</Button><Button size="sm" variant="danger" onClick={() => removeTask(task)}>Delete</Button></div>
                    </div>
                </Card>;
            })}
        </div>
    </div>;
};

export default TasksPage;
