'use client'

import { Sidebar, Card, CreateButton, SubmitButton, InputField } from '@/app/components/components';
import { adminTabs, logsColumns } from '@/app/data/data';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {

    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const columns = logsColumns();
    const [logs, setLogs] = useState([]);
    const [detailsModal, setDetailsModal] = useState(null);
    const [viewDetails, setViewDetails] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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
        const fetchLogs = async () => {
            try {
                const response = await fetch('/api/logs');
                const data = await response.json();
                setLogs(data);
            } catch (error) {
                setErrorMessage(error);
                setTimeout(() => setErrorMessage(''), 3000);

            }
        }
        fetchLogs();
    }, []);

    if (!loading && currentUser !== 'admin') { return null; }

    return (
        <>
            <div className='flex h-screen w-screen m-0 p-0'>
                <Sidebar tabs={adminTabs()} />
                <div className="flex flex-col m-0 p-[1.3em] h-[100%] w-[100%] gap-y-[20px] items-center">
                    <Card columns={columns} data={logs}
                        onRowClick={(logs) => {
                            setDetailsModal(logs);
                            setViewDetails(true);
                        }} />
                </div>
            </div>

            {viewDetails && detailsModal && (
                <LogDetailsModal
                    log={detailsModal}
                    onClose={() => setViewDetails(false)}
                />
            )}
        </>
    );
}

function LogDetailsModal({ log, onClose }) {
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const formattedDate = new Date(log.log_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await fetch(`/api/inventory_logs/log_entry/${log.log_id}`);
                const data = await res.json();

                const enriched = await Promise.all(
                    data.map(async (entry) => {
                        const materialRes = await fetch(`/api/inventory_logs/materials/${entry.material_id}`);
                        const nameData = await materialRes.json();
                        const materialName = typeof nameData === 'string'
                            ? nameData
                            : nameData?.name || 'Unknown Material';

                        return {
                            ...entry,
                            material_name: materialName,
                        };
                    })
                );

                setEntries(enriched);
            } catch (error) {
                console.error('Failed to fetch log entry details:', error);
                setEntries([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntries();
    }, [log]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#F9F9F9] w-[45%] h-[65%] p-10 rounded shadow-lg flex flex-col overflow-y-auto">
                <button
                    onClick={onClose}
                    className="text-sm text-gray-700 hover:text-black cursor-pointer self-end"
                >
                    X
                </button>

                <h3 className="text-2xl font-semibold mb-4 border-b border-b-[#0C2D49] pb-[5px]">
                    {log.projectname}: {log.location}
                </h3>

                <div className="flex flex-col gap-y-[5px] mb-2 text-sm">
                    <div><strong>Log ID:</strong> {log.log_id}</div>
                    <div><strong>Date:</strong> {formattedDate}</div>
                    <div><strong>Project Manager:</strong> {log.project_manager}</div>
                </div>

                <div className="overflow-y-auto min-h-[70%] border border-[#0C2D49] rounded-sm">
                    {isLoading ? (
                        <div className="text-center py-4 text-gray-500">Loading entries...</div>
                    ) : (
                        <table className="min-w-full border-separate border-spacing-0 border-none text-sm">
                            <thead>
                                <tr className="bg-[#0C2D49] text-[#F9F9F9]">
                                    <th className="border-none px-4 py-4 text-center font-normal">Material</th>
                                    <th className="border-none px-4 py-4 text-center font-normal">Beginning Qty</th>
                                    <th className="border-none px-4 py-4 text-center font-normal">Received</th>
                                    <th className="border-none px-4 py-4 text-center font-normal">Used</th>
                                    <th className="border-none px-4 py-4 text-center font-normal">Ending Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.length > 0 ? (
                                    entries.map((entry) => (
                                        <tr key={entry.entry_id}>
                                            <td className="px-4 py-3 text-center">{entry.material_name}</td>
                                            <td className="px-4 py-3 text-center">{entry.beginning_qty}</td>
                                            <td className="px-4 py-3 text-center">{entry.qty_received}</td>
                                            <td className="px-4 py-3 text-center">{entry.qty_used}</td>
                                            <td className="px-4 py-3 text-center">{entry.ending_qty}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-gray-500">
                                            No entries found for this log.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

