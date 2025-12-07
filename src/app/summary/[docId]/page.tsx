'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';

interface CornellNote {
    cues_left: string;
    notes_right: string;
    summary_bottom: string;
    stage_id: number;
}

interface SummaryData {
    document_id: number;
    total_stages: number;
    total_vocab_suggested: number;
    cornell_notes: CornellNote[];
}

export default function SummaryPage({ params }: { params: { docId: string } }) {
    const { docId } = params;
    const router = useRouter();
    const [summary, setSummary] = useState<SummaryData | null>(null);

    useEffect(() => {
        loadSummary();
    }, [docId]);

    const loadSummary = async () => {
        try {
            const data = await fetchAPI(`/api/documents/${docId}/summary`);
            setSummary(data);
        } catch (e) {
            console.error(e);
        }
    };

    if (!summary) return <div className="p-8 text-center">Loading summary...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <button onClick={() => router.push('/dashboard')} className="text-indigo-600 hover:text-indigo-800 font-medium">&larr; Back to Dashboard</button>
                    <h1 className="text-3xl font-bold text-gray-900">Document Summary</h1>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <span className="block text-4xl font-bold text-indigo-600">{summary.total_stages}</span>
                        <span className="text-gray-500">Reading Stages</span>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <span className="block text-4xl font-bold text-green-600">{summary.total_vocab_suggested}</span>
                        <span className="text-gray-500">New Words</span>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <span className="block text-4xl font-bold text-purple-600">{summary.cornell_notes.length}</span>
                        <span className="text-gray-500">Notes Taken</span>
                    </div>
                </div>

                {/* Notes Timeline */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Your Learning Journey</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {summary.cornell_notes.map((note, i) => (
                            <div key={i} className="p-6">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Stage {i + 1} Notes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div className="bg-gray-50 p-4 rounded border">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Cues</h4>
                                        <p className="whitespace-pre-wrap text-gray-700">{note.cues_left}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded border">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Notes</h4>
                                        <p className="whitespace-pre-wrap text-gray-700">{note.notes_right}</p>
                                    </div>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded border border-indigo-100">
                                    <h4 className="text-xs font-bold text-indigo-500 uppercase mb-2">Summary</h4>
                                    <p className="whitespace-pre-wrap text-indigo-900 font-medium">{note.summary_bottom}</p>
                                </div>
                            </div>
                        ))}
                        {summary.cornell_notes.length === 0 && (
                            <div className="p-8 text-center text-gray-500 italic">
                                No notes recorded yet. Go back to read and take some notes!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
