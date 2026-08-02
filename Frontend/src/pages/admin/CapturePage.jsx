import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { captureApi, opportunitiesApi } from '../../api';
import { Button, Card, Input, PageLoader, Textarea } from '../../components/ui';
import { fieldClass, labelFor } from './taskOptions';

const types = ['job', 'internship', 'scholarship', 'fellowship', 'conference', 'competition', 'volunteer', 'other'];
const platforms = ['facebook', 'linkedin', 'website', 'email', 'telegram', 'other'];
const modes = ['remote', 'onsite', 'hybrid', 'not_specified'];
const blank = { title: '', organization: '', summary: '', opportunity_type: 'other', source_platform: 'website', source_url: '', application_url: '', location: '', work_mode: 'not_specified', deadline: '', eligibility: '', requirements: '', funding_or_salary: '', is_deadline_confirmed: false };
const localDate = (value) => value ? new Date(value).toISOString().slice(0, 16) : '';

export default function CapturePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [url, setUrl] = useState('');
    const [captureId, setCaptureId] = useState(id || null);
    const [form, setForm] = useState(blank);
    const [candidates, setCandidates] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [loading, setLoading] = useState(Boolean(id));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const populate = (capture, extracted = capture.data || capture.extracted_data || {}) => {
        const deadlines = extracted.deadline_candidates || [];
        setCaptureId(capture.id);
        setUrl(capture.url || url);
        setCandidates(deadlines);
        setWarnings(capture.warnings || (capture.error_message ? [capture.error_message] : []));
        setForm({ ...blank, ...extracted, source_url: capture.url || url, deadline: deadlines[0] ? localDate(deadlines[0].value) : '', is_deadline_confirmed: false });
    };

    useEffect(() => {
        if (!id) return;
        captureApi.get(id).then((capture) => {
            if (capture.created_opportunity) navigate(`/admin/opportunities/${capture.created_opportunity}`, { replace: true });
            else populate(capture);
        }).catch((e) => setError(e.displayMessage || 'Could not load captured link.')).finally(() => setLoading(false));
    }, [id, navigate]);

    const extract = async (event) => {
        event.preventDefault(); setLoading(true); setError(''); setWarnings([]);
        try { populate(await captureApi.extract(url)); }
        catch (e) { setError(e.displayMessage || 'The link could not be extracted safely.'); }
        finally { setLoading(false); }
    };
    const change = (event) => setForm({ ...form, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });
    const save = async (event) => {
        event.preventDefault();
        if (!form.is_deadline_confirmed) { setError('Review the deadline and explicitly confirm it before saving.'); return; }
        setSaving(true); setError('');
        try {
            const opportunity = await opportunitiesApi.create({ ...form, deadline: form.deadline || null, status: 'captured', extraction_confidence: 0 });
            await captureApi.linkOpportunity(captureId, opportunity.id);
            toast.success('Opportunity created from reviewed link');
            navigate(`/admin/opportunities/${opportunity.id}`);
        } catch (e) { setError(e.displayMessage || 'Could not create the opportunity.'); }
        finally { setSaving(false); }
    };

    if (loading) return <PageLoader />;
    if (!captureId) return <div className="max-w-3xl mx-auto space-y-6"><div><h1 className="text-3xl font-bold">Capture Opportunity</h1><p className="text-gray-500">Extract public information from a link, then review it before anything is saved as an opportunity.</p></div><Card hover={false}><form onSubmit={extract} className="space-y-4"><Input label="Public opportunity URL" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://example.com/opportunity" />{error && <p role="alert" className="p-3 rounded-lg bg-red-50 text-red-700">{error}</p>}<Button type="submit">Extract information</Button></form></Card></div>;

    return <div className="max-w-4xl mx-auto space-y-6"><div><h1 className="text-3xl font-bold">Review Captured Link</h1><p className="text-gray-500 break-all">{url}</p></div>{warnings.map((warning) => <div key={warning} role="status" className="p-4 bg-amber-50 text-amber-800 rounded-xl">{warning}</div>)}<Card hover={false}><form onSubmit={save} className="space-y-4">{error && <p role="alert" className="p-3 rounded-lg bg-red-50 text-red-700">{error}</p>}<p className="text-sm text-amber-700">Extracted values may be uncertain. Verify every field against the original page.</p><Input label="Title" name="title" value={form.title} onChange={change} required /><Input label="Organization" name="organization" value={form.organization} onChange={change} required /><div className="grid sm:grid-cols-3 gap-3">{[['opportunity_type', types], ['source_platform', platforms], ['work_mode', modes]].map(([name, values]) => <label key={name}>{labelFor(name)}<select className={fieldClass} name={name} value={form[name]} onChange={change}>{values.map((value) => <option key={value} value={value}>{labelFor(value)}</option>)}</select></label>)}</div><Input label="Application URL" type="url" name="application_url" value={form.application_url} onChange={change} /><Input label="Location" name="location" value={form.location} onChange={change} /><Textarea label="Summary" name="summary" value={form.summary} onChange={change} /><Textarea label="Eligibility" name="eligibility" value={form.eligibility} onChange={change} /><Textarea label="Requirements" name="requirements" value={form.requirements} onChange={change} /><Input label="Funding or salary" name="funding_or_salary" value={form.funding_or_salary} onChange={change} />{candidates.length > 0 && <fieldset><legend className="font-medium mb-2">Detected deadline candidates</legend><div className="space-y-2">{candidates.map((candidate) => <label key={`${candidate.value}-${candidate.text}`} className="flex gap-2 p-3 border rounded-lg"><input type="radio" name="candidate" checked={form.deadline === localDate(candidate.value)} onChange={() => setForm({ ...form, deadline: localDate(candidate.value), is_deadline_confirmed: false })} /><span>{candidate.text} <small>({Math.round(candidate.confidence * 100)}% confidence)</small></span></label>)}</div></fieldset>}<Input label="Deadline (manual entry allowed)" type="datetime-local" name="deadline" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value, is_deadline_confirmed: false })} /><label className="flex items-start gap-2 p-3 border rounded-lg"><input type="checkbox" name="is_deadline_confirmed" checked={form.is_deadline_confirmed} onChange={change} required /><span>I reviewed and confirm this deadline information. No reminder is created by this action.</span></label><Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create Opportunity'}</Button></form></Card></div>;
}
