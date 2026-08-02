import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tasksApi } from '../../api';
import { Button, Card, Input, PageLoader, Textarea } from '../../components/ui';
import { areas, fieldClass, labelFor, priorities, statuses } from './taskOptions';

const emptyTask = {
    title: '', description: '', area: 'personal', priority: 'medium', status: 'planned',
    start_at: '', due_at: '', progress_percentage: 0, estimated_minutes: 0,
    next_action: '', is_recurring: false, recurrence_rule: '',
};
const toInputDate = (value) => value ? new Date(value).toISOString().slice(0, 16) : '';

const TaskFormPage = () => {
    const { id } = useParams();
    const editing = Boolean(id);
    const navigate = useNavigate();
    const [values, setValues] = useState(emptyTask);
    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!editing) return;
        tasksApi.get(id).then((task) => setValues({ ...task, start_at: toInputDate(task.start_at), due_at: toInputDate(task.due_at) })).catch((requestError) => setError(requestError.displayMessage || 'Could not load task.')).finally(() => setLoading(false));
    }, [editing, id]);

    const change = (event) => {
        const { name, value, type, checked } = event.target;
        setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        const progress = Number(values.progress_percentage);
        if (progress < 0 || progress > 100) return setError('Progress must be between 0 and 100.');
        if (Number(values.estimated_minutes) < 0) return setError('Estimated minutes cannot be negative.');
        if (values.start_at && values.due_at && new Date(values.due_at) < new Date(values.start_at)) return setError('Due time cannot be earlier than start time.');
        setSaving(true);
        try {
            const payload = { ...values, progress_percentage: progress, estimated_minutes: Number(values.estimated_minutes), start_at: values.start_at || null, due_at: values.due_at || null };
            const task = editing ? await tasksApi.update(id, payload) : await tasksApi.create(payload);
            toast.success(editing ? 'Task updated' : 'Task created');
            navigate(`/admin/tasks/${task.id}`);
        } catch (requestError) {
            setError(requestError.displayMessage || 'Could not save task.');
        } finally { setSaving(false); }
    };

    if (loading) return <PageLoader />;
    return <div className="max-w-4xl mx-auto space-y-6">
        <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">{editing ? 'Edit Task' : 'Add Task'}</h1><p className="text-gray-500">Define a clear outcome and next action.</p></div>
        <Card hover={false}><form onSubmit={submit} className="space-y-4">
            {error && <p role="alert" className="p-3 rounded-lg bg-red-50 text-red-700">{error}</p>}
            <Input label="Title" name="title" value={values.title} onChange={change} required maxLength="255" />
            <Textarea label="Description" name="description" value={values.description} onChange={change} rows="4" />
            <div className="grid sm:grid-cols-3 gap-4">{[['area', areas], ['priority', priorities], ['status', statuses]].map(([name, options]) => <label key={name} className="text-sm font-medium">{labelFor(name)}<select name={name} value={values[name]} onChange={change} className={fieldClass}>{options.map((option) => <option value={option} key={option}>{labelFor(option)}</option>)}</select></label>)}</div>
            <div className="grid sm:grid-cols-2 gap-4"><Input label="Start" name="start_at" type="datetime-local" value={values.start_at} onChange={change} /><Input label="Due" name="due_at" type="datetime-local" value={values.due_at} onChange={change} /></div>
            <div className="grid sm:grid-cols-2 gap-4"><Input label="Progress percentage" name="progress_percentage" type="number" min="0" max="100" value={values.progress_percentage} onChange={change} /><Input label="Estimated minutes" name="estimated_minutes" type="number" min="0" value={values.estimated_minutes} onChange={change} /></div>
            <Textarea label="Next action" name="next_action" value={values.next_action} onChange={change} rows="2" />
            <label className="flex items-center gap-2"><input name="is_recurring" type="checkbox" checked={values.is_recurring} onChange={change} /> Recurring task</label>
            {values.is_recurring && <Input label="Recurrence rule" name="recurrence_rule" value={values.recurrence_rule} onChange={change} placeholder="Example: weekly on Sunday" />}
            <div className="flex flex-wrap gap-3"><Button type="submit" isLoading={saving}>Save Task</Button><Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button></div>
        </form></Card>
    </div>;
};

export default TaskFormPage;
