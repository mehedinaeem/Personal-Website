import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { dailyReviewsApi } from '../../api';
import { Button, Card, Input, PageLoader, Textarea } from '../../components/ui';

const localDate = () => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const value = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
    return `${value.year}-${value.month}-${value.day}`;
};

const emptyReview = { review_date: localDate(), completed_today: '', unfinished_work: '', main_blocker: '', tomorrow_priority: '', productivity_rating: 3, notes: '' };

const DailyReviewPage = () => {
    const [values, setValues] = useState(emptyReview);
    const [exists, setExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        dailyReviewsApi.get(emptyReview.review_date).then((review) => { setValues(review); setExists(true); }).catch((requestError) => { if (requestError.response?.status !== 404) setError(requestError.displayMessage || 'Could not load review.'); }).finally(() => setLoading(false));
    }, []);
    const change = (event) => setValues({ ...values, [event.target.name]: event.target.value });
    const submit = async (event) => {
        event.preventDefault(); setSaving(true); setError('');
        try {
            const payload = { ...values, productivity_rating: Number(values.productivity_rating) };
            const saved = exists ? await dailyReviewsApi.update(values.review_date, payload) : await dailyReviewsApi.create(payload);
            setValues(saved); setExists(true); toast.success('Daily review saved');
        } catch (requestError) { setError(requestError.displayMessage || 'Could not save review.'); }
        finally { setSaving(false); }
    };
    if (loading) return <PageLoader />;
    return <div className="max-w-4xl mx-auto space-y-6"><div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Review</h1><p className="text-gray-500">Reflect on today in Asia/Dhaka time.</p></div><Card hover={false}><form onSubmit={submit} className="space-y-4">{error && <p role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg">{error}</p>}<Input label="Review date" name="review_date" type="date" value={values.review_date} disabled={exists} max={localDate()} onChange={change} required /><Textarea label="Completed today" name="completed_today" value={values.completed_today} onChange={change} rows="3" /><Textarea label="Unfinished work" name="unfinished_work" value={values.unfinished_work} onChange={change} rows="3" /><Textarea label="Main blocker" name="main_blocker" value={values.main_blocker} onChange={change} rows="2" /><Textarea label="Tomorrow’s priority" name="tomorrow_priority" value={values.tomorrow_priority} onChange={change} rows="2" /><Input label="Productivity rating (1–5)" name="productivity_rating" type="number" min="1" max="5" value={values.productivity_rating} onChange={change} required /><Textarea label="Notes" name="notes" value={values.notes} onChange={change} rows="4" /><Button type="submit" isLoading={saving}>Save Review</Button></form></Card></div>;
};

export default DailyReviewPage;
