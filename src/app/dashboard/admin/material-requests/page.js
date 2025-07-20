'use client'

import { Sidebar, Card, CreateButton, SubmitButton, InputField } from '@/app/components/components';
import { adminTabs, requestsColumns } from '@/app/data/data';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submittedStatuses, setSubmittedStatuses] = useState({});
    const columns = requestsColumns();
    const [errorMessage, setErrorMessage] = useState('');
    const [requests, setRequests] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [viewProject, setViewProject] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        setCurrentUser(storedUser);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!currentUser && !loading && currentUser !== 'admin') {
            router.push('/');
        }
    }, [currentUser, loading]);

    const fetchRequests = async () => {
        try {
            const response = await fetch('/api/requests');
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            setErrorMessage(error);
            setTimeout(() => setErrorMessage(''), 3000);
        }
    }

    useEffect(() => {
        fetchRequests();
    }, []);

    if (!loading && currentUser !== 'admin') { return null; }

    return (
        <>
            <div className='flex h-screen w-screen m-0 p-0'>
                <Sidebar tabs={adminTabs()} />
                <div className="flex flex-col m-0 p-[1.3em] h-[100%] w-[100%] gap-y-[20px] items-center">
                    <Card columns={columns} data={requests}
                        onRowClick={(request) => {
                            const savedStatus = submittedStatuses[request.request_id] || request.status || 'Pending';
                            setViewProject({ ...request, savedStatus });
                            setShowDetailsModal(true);
                        }} />
                </div>
            </div>

            {showDetailsModal && viewProject && (
                <ViewRequestModal
                    request={viewProject}
                    onClose={() => {
                        setViewProject(null);
                        setShowDetailsModal(false);
                    }}
                    setSubmittedStatuses={setSubmittedStatuses}
                    fetchRequests={fetchRequests}
                />
            )}
        </>
    );
}

function ViewRequestModal({ request, onClose, setSubmittedStatuses, fetchRequests }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestStatus, setRequestStatus] = useState(request.savedStatus || 'Pending');

    const requestId = request?.request_id;
    const requestDate = new Date(request?.request_date).toLocaleDateString();

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await fetch(`/api/requests/entries/${requestId}`);
                const data = await res.json();
                setEntries(data);
            } catch (error) {
                console.error('Error fetching request entries:', error);
                setEntries([]);
            } finally {
                setLoading(false);
            }
        };

        if (requestId) {
            fetchEntries();
        }
    }, [requestId]);

    useEffect(() => {
        if (entries.length === 0) return;

        const isCompleted = entries.every((entry) =>
            entry.status === 'Rejected' ||
            ((entry.qty_received ?? 0) >= (entry.qty_requested ?? 0) && entry.status === 'Accepted')
        );

        const isIncomplete = entries.some((entry) =>
            !(entry.status === 'Rejected' ||
                ((entry.qty_received ?? 0) >= (entry.qty_requested ?? 0) && entry.status === 'Accepted'))
        );

        if (isCompleted && requestStatus !== 'Completed') {
            setRequestStatus('Completed');
        } else if (isIncomplete && requestStatus !== 'Incomplete') {
            setRequestStatus('Incomplete');
        }
    }, [entries, requestStatus]);




    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#F9F9F9] w-[45%] h-[60%] p-10 rounded shadow-lg flex flex-col overflow-y-auto">
                <button
                    onClick={onClose}
                    className="text-sm text-gray-700 hover:text-black cursor-pointer self-end"
                >
                    X
                </button>

                <h3 className="text-2xl font-semibold mb-4 border-b border-b-[#0C2D49] pb-[5px]">
                    Request Date: {requestDate}
                </h3>

                {/* <div className="mb-3 self-start">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overall Request Status:</label>
                    <select
                        value={requestStatus}
                        onChange={(e) => setRequestStatus(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded text-sm"
                    >
                        <option value="Pending" disabled>Pending</option>
                        <option value="Completed" disabled>Completed</option>
                        <option value="Incomplete" disabled>Incomplete</option>
                    </select>
                </div> */}

                <div className="overflow-y-auto min-h-[70%] border border-[#0C2D49] rounded-sm">
                    {loading ? (
                        <div className="text-center py-4 text-gray-500">Loading entries...</div>
                    ) : entries.length > 0 ? (
                        <table className="min-w-full border-separate border-spacing-0 border-none text-sm">
                            <thead>
                                <tr className="bg-[#0C2D49] text-[#F9F9F9]">
                                    <th className="border-none px-4 py-4 text-center font-normal">Material Name</th>
                                    <th className="border-none px-4 py-4 text-center font-normal">Qty Requested</th>
                                    <th className="border-none px-4 py-4 text-center font-normal">Qty Received</th>
                                    <th className="border-none px-4 py-4 text-center font-normal">Status</th>
                                    <th className="border-none px-4 py-4 text-center font-normal">Completed</th>
                                </tr>
                            </thead>

                            <tbody>
                                {entries.map((entry, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 text-center">{entry.material_name}</td>
                                        <td className="px-4 py-3 text-center">{entry.qty_requested ?? 0}</td>
                                        <td className="px-4 py-3 text-center">{entry.qty_received ?? 0}</td>
                                        <td className="px-4 py-3 text-center">
                                            <select
                                                value={entry.status}
                                                onChange={(e) => {
                                                    const updated = [...entries];
                                                    updated[index].status = e.target.value;
                                                    setEntries(updated);
                                                }}
                                                className="border border-gray-300 px-2 py-1 rounded text-sm"
                                            >
                                                <option value="Pending" disabled>Pending</option>
                                                <option value="Accepted">Accepted</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {(entry.status === 'Rejected') ||
                                                ((entry.qty_received ?? 0) >= (entry.qty_requested ?? 0) && entry.status === 'Accepted')
                                                ? '✅'
                                                : '❌'}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            No entries found for this request.
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        className="bg-[#0C2D49] text-[#F9F9F9] text-sm py-2 px-6 rounded cursor-pointer"
                        onClick={async () => {
                            try {
                                const res = await fetch(`/api/requests/review/${requestId}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ entries, requestStatus }),
                                });

                                if (!res.ok) throw new Error('Failed to submit review');

                                setSubmittedStatuses(prev => ({
                                    ...prev,
                                    [requestId]: requestStatus
                                }));

                                await fetchRequests();
                                onClose();
                            } catch (error) {
                                alert('An error occurred while submitting.');
                                console.error(error);
                            }
                        }}
                    >
                        Submit Review
                    </button>
                </div>
            </div>
        </div>
    );
}
