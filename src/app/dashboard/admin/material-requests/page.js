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
        const storedUser = sessionStorage.getItem('currentUser');
        setCurrentUser(storedUser);
        setLoading(false); 
    }, []);

    useEffect(() => {
        if (!currentUser && !loading && currentUser !== 'admin') {
            router.push('/');
        }
    }, [currentUser, loading]);

    if (loading) {
        return <div className="p-8 text-gray-500 text-lg">Checking access...</div>;
    }

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.3)]">
            <div className="bg-white w-[700px] rounded-lg shadow-lg relative p-6 text-black">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Request Details</h3>
                    <button
                        onClick={onClose}
                        className="text-[#0C2D49] text-lg font-bold cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-500">DATE</p>
                    <p className="font-medium">{requestDate}</p>
                    <div className="w-full h-[1px] bg-black mt-2"></div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-700 border-b pb-2 mb-2">
                    <div>Material Name</div>
                    <div>Qty Requested</div>
                    <div>Qty Received</div>
                    <div>Status</div>
                </div>

                {loading ? (
                    <p className="text-sm text-gray-500 py-4">Loading entries...</p>
                ) : entries.length > 0 ? (
                    entries.map((entry, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-4 gap-4 text-sm text-gray-800 py-2 border-b"
                        >
                            <div>{entry.material_name}</div>
                            <div>{entry.qty_requested ?? 0}</div>
                            <div>{entry.qty_received ?? 0}</div>
                            <div>{entry.status}</div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 py-4">No entries found for this request.</p>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#0A2C46] text-white rounded-md hover:bg-[#083047]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
