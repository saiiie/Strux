'use client'

import { Sidebar, Card, CreateButton, SubmitButton, InputField } from '@/app/components/components';
import { adminTabs, requestsColumns } from '@/app/data/data';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
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
        fetchRequests();
    }, []);

    if (!loading && currentUser !== 'admin') { return null; }

    return (
        <>
            <div className='flex h-screen w-screen m-0 p-0'>
                <Sidebar tabs={adminTabs()} />
                <div className="flex flex-col m-0 p-[1.3em] h-[100%] w-[100%] gap-y-[20px] items-center">
                    <Card columns={columns} data={requests}
                        onRowClick={(requests) => {
                            setViewProject(requests);
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
                />
            )}
        </>
    );
}

function ViewRequestModal({ request, onClose }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    const requestId = request?.request_id;
    const requestDate = new Date(request?.request_date).toLocaleDateString();

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await fetch(`/api/requests/entries/${requestId}`);
                const data = await res.json();
                setEntries(data);
                console.log(data);
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

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#F9F9F9] w-[45%] h-[55%] p-10 rounded shadow-lg flex flex-col overflow-y-auto">
                <button
                    onClick={onClose}
                    className="text-sm text-gray-700 hover:text-black cursor-pointer self-end"
                >
                    X
                </button>

                <h3 className="text-2xl font-semibold mb-4 border-b border-b-[#0C2D49] pb-[5px]">
                    Request Date: {requestDate}
                </h3>

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
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 text-center">{entry.material_name}</td>
                                        <td className="px-4 py-3 text-center">{entry.qty_requested ?? 0}</td>
                                        <td className="px-4 py-3 text-center">{entry.qty_received ?? 0}</td>
                                        <td className="px-4 py-3 text-center">{entry.status}</td>
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

                <div className="flex gap-x-3 m-0 p-0 mt-4 self-end">
                    <button className="bg-[#0C2D49] text-[#F9F9F9] text-sm py-2 px-6 rounded cursor-pointer">Reject Request</button>
                    <button className="bg-[#0C2D49] text-[#F9F9F9] text-sm py-2 px-6 rounded cursor-pointer">Accept Request</button>
                </div>
            </div>
        </div>
    );
}
