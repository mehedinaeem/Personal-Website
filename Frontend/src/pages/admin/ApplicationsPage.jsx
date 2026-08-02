import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { applicationsApi } from '../../api';
import { Button, Card, PageLoader } from '../../components/ui';
import { fieldClass, labelFor, pageResults } from './taskOptions';

export const applicationStages = ['saved','reviewing','preparing_documents','ready_to_apply','applied','assessment','interview','waiting_for_result','selected','rejected','withdrawn','expired'];

const ApplicationsPage = ({ filter = 'all', stage: fixedStage = '' }) => {
    const { stage: routeStage } = useParams();
    const [rows, setRows] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [stage, setStage] = useState(fixedStage || routeStage || '');
    const load = useCallback(async () => {
        setLoading(true); setError('');
        const params = {};
        if (stage) params.stage = stage;
        if (filter === 'follow-up') params.overdue_follow_up = true;
        try { setRows(pageResults(await applicationsApi.getAll(params))); }
        catch (requestError) { setError(requestError.displayMessage || 'Could not load applications.'); }
        finally { setLoading(false); }
    }, [filter, stage]);
    useEffect(() => { load(); }, [load]);
    const remove = async (row) => { if (!window.confirm(`Delete application for “${row.opportunity_title}”?`)) return; await applicationsApi.delete(row.id); toast.success('Application deleted'); load(); };
    if (loading) return <PageLoader />;
    return <div className="space-y-6"><div className="flex flex-col sm:flex-row justify-between gap-4"><div><h1 className="text-3xl font-bold">{filter === 'follow-up' ? 'Follow-up Required' : 'Applications'}</h1><p className="text-gray-500">Track each submission separately from saved opportunities.</p></div><Button to="/admin/opportunities">Browse Opportunities</Button></div>{filter !== 'follow-up' && <label className="block max-w-sm">Applications by stage<select aria-label="Filter applications by stage" className={fieldClass} value={stage} onChange={(e) => setStage(e.target.value)}><option value="">All stages</option>{applicationStages.map((value) => <option value={value} key={value}>{labelFor(value)}</option>)}</select></label>}{error && <div role="alert" className="p-4 bg-red-50 text-red-700 rounded-xl">{error} <button className="underline" onClick={load}>Retry</button></div>}{!rows.length && !error ? <Card hover={false}><p className="text-gray-500">No applications match this view.</p></Card> : rows.map((row) => <Card hover={false} key={row.id}><div className="flex flex-col sm:flex-row justify-between gap-4"><div><Link to={`/admin/applications/${row.id}`} className="text-lg font-semibold text-sky-600">{row.opportunity_title}</Link><p className="text-sm text-gray-500">{row.organization} · {labelFor(row.stage)}</p>{row.follow_up_at && <p className="text-sm mt-2">Follow up: {new Date(row.follow_up_at).toLocaleString()}</p>}</div><Button size="sm" variant="danger" onClick={() => remove(row)}>Delete</Button></div></Card>)}</div>;
};

export default ApplicationsPage;
