import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { remindersApi } from '../../api';
import { Button, Card, Input } from '../ui';

const rowsFrom = (value) => value?.results || value || [];
const initialTime = () => new Date(Date.now() + 3600000).toISOString().slice(0, 16);
const typeMap = { task: 'task_due', goal: 'goal_due', opportunity: 'opportunity_deadline', application: 'application_follow_up', learning_item: 'learning_target', travel_plan: 'travel_start', travel_itinerary_item: 'travel_itinerary', travel_checklist_item: 'travel_checklist' };

export default function RemindersPanel({ referenceType = '', referenceId = '', reminderType = 'custom' }) {
    const [rows, setRows] = useState([]);
    const [scheduledAt, setScheduledAt] = useState(initialTime);
    const [channel, setChannel] = useState('telegram');
    const [selectedReference, setSelectedReference] = useState(referenceType);
    const [selectedId, setSelectedId] = useState(referenceId);
    const [error, setError] = useState('');
    const load = useCallback(async () => {
        try {
            const values = rowsFrom(await remindersApi.list());
            setRows(referenceType ? values.filter((item) => String(item[referenceType]) === String(referenceId)) : values);
        } catch (requestError) { setError(requestError.displayMessage || 'Could not load reminders.'); }
    }, [referenceId, referenceType]);
    useEffect(() => { load(); }, [load]);
    const add = async (event) => {
        event.preventDefault(); setError('');
        try {
            const payload = { reminder_type: selectedReference ? typeMap[selectedReference] : reminderType, scheduled_at: new Date(scheduledAt).toISOString(), channel };
            if (selectedReference) payload[selectedReference] = selectedId;
            await remindersApi.create(payload); toast.success('Reminder added'); setScheduledAt(initialTime()); load();
        } catch (requestError) { setError(requestError.displayMessage || 'Could not add reminder.'); }
    };
    const cancel = async (id) => { await remindersApi.cancel(id); toast.success('Reminder cancelled'); load(); };
    const remove = async (id) => { if (!window.confirm('Delete this reminder?')) return; await remindersApi.delete(id); load(); };
    const changeTime = async (row) => {
        const value = window.prompt('New reminder time (YYYY-MM-DDTHH:MM)', new Date(row.scheduled_at).toISOString().slice(0, 16));
        if (!value) return;
        await remindersApi.update(row.id, { scheduled_at: new Date(value).toISOString() }); toast.success('Reminder time updated'); load();
    };
    const changeChannel = async (row) => { await remindersApi.update(row.id, { channel: row.channel === 'telegram' ? 'email' : 'telegram' }); toast.success('Reminder channel updated'); load(); };
    return <Card hover={false}>
        <h2 className="text-xl font-semibold mb-3">Reminders</h2>
        <form onSubmit={add} className="grid sm:grid-cols-3 gap-3 items-end">
            {!referenceType && <>
                <label>Related item<select className="w-full mt-1 px-3 py-2 border rounded-lg" value={selectedReference} onChange={(event) => setSelectedReference(event.target.value)}><option value="">Custom reminder</option>{Object.keys(typeMap).map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></label>
                {selectedReference && <Input label="Related item ID" type="number" min="1" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} required />}
            </>}
            <Input label="Reminder time" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} required />
            <label>Channel<select className="w-full mt-1 px-3 py-2 border rounded-lg" value={channel} onChange={(event) => setChannel(event.target.value)}><option value="telegram">Telegram</option><option value="email">Email</option></select></label>
            <Button type="submit">Add reminder</Button>
        </form>
        {error && <p role="alert" className="mt-3 text-red-600">{error}</p>}
        <div className="mt-4 space-y-2">{rows.length === 0 ? <p className="text-gray-500">No reminders.</p> : rows.map((row) => <div key={row.id} className="flex flex-col sm:flex-row justify-between gap-2 border-t pt-2"><span>{new Date(row.scheduled_at).toLocaleString()} · {row.channel} · {row.status}</span><span className="flex flex-wrap gap-2">{!['sent', 'cancelled'].includes(row.status) && <><button type="button" className="text-sky-600" onClick={() => changeTime(row)}>Change time</button><button type="button" className="text-sky-600" onClick={() => changeChannel(row)}>Use {row.channel === 'telegram' ? 'email' : 'Telegram'}</button><button type="button" className="text-amber-600" onClick={() => cancel(row.id)}>Cancel</button></>}<button type="button" className="text-red-600" onClick={() => remove(row.id)}>Delete</button></span></div>)}</div>
    </Card>;
}
