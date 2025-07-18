'use client';

import { Sidebar, Card, CreateButton } from '@/app/components/components';
import { pmTabs, requestsPMColumns } from '@/app/data/data';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CirclePlus } from 'lucide-react';
import addRequest from '@/lib/requests/addRequest'

export default function MaterialRequestsPage() {
    const router = useRouter();
    const params = useParams();
    const pmid = params.id;

    const columns = requestsPMColumns();
    const [requests, setRequests] = useState([]);
    const [projectName, setProjectName] = useState('');
    const [projectId, setProjectId] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState([{ material: '', requestedQty: 0 }]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        setCurrentUser(storedUser);
    }, []);

    useEffect(() => {
        if (!currentUser || !pmid) return;

        if (currentUser === 'admin' || pmid !== currentUser) {
            router.push('/');
        }
    }, [currentUser, pmid]);

    useEffect(() => {
        const fetchMaterialRequests = async () => {
            try {
                const res = await fetch(`/api/material-requests/${currentUser}`);
                const data = await res.json();
                setRequests(data);

                if (Array.isArray(data) && data.length > 0) {
                    if (data[0]?.projectname) {
                        setProjectName(data[0].projectname);
                    }
                    if (data[0]?.projectid) {
                        setProjectId(data[0].projectid);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (currentUser) fetchMaterialRequests();
    }, [currentUser]);

    return (
        <div className='flex h-screen w-screen m-0 p-0'>
            <Sidebar tabs={pmTabs()} />
            <div className="flex flex-col m-0 p-[1.3em] h-[100%] w-[100%] gap-y-[20px] items-center">
                <h2 className="text-2xl font-semibold self-start">{projectName}</h2>

                <Card columns={columns} data={requests}
                    onRowClick={(row) => setSelectedRequest(row)}
                />

                <CreateButton
                    text="Create New Request"
                    svg={<CirclePlus size={16} color="#FBFBFB" />}
                    onClick={() => setIsCreateModalOpen(true)}
                />

                {selectedRequest && (
                    <ViewRequestModal
                        request={selectedRequest}
                        onClose={() => setSelectedRequest(null)}
                    />
                )}

                {isCreateModalOpen && (
                    <CreateRequestModal
                        onClose={() => setIsCreateModalOpen(false)}
                        projectId={projectId}
                    />
                )}
            </div>
        </div>
    );
}

function CreateRequestModal({ onClose, projectId }) {
    const [materials, setMaterials] = useState([]);
    const [rows, setRows] = useState([
        { materialId: '', qtyRequested: '' }
    ]);

    useEffect(() => {
        fetch('/api/materials')
            .then(res => res.json())
            .then(setMaterials)
            .catch(err => console.error('Failed to fetch materials:', err));
    }, []);

    const handleRowChange = (index, field, value) => {
        const updated = [...rows];
        updated[index][field] = value;
        setRows(updated);
    };

    const addRow = () => {
        setRows(prev => [...prev, { materialId: '', qtyRequested: '' }]);
    };

    const handleSubmit = async () => {
        try {
            const response = await addRequest(projectId, rows);
            if (response.success) {
                onClose();
            } else {
                alert('Request creation failed');
            }
        } catch (err) {
            console.error('Error submitting request:', err);
            alert('Something went wrong');
        }
    };

    return (
        <div className="fixed top-0 left-0 z-[100] flex justify-center items-center h-screen w-screen bg-[rgba(0,0,0,0.3)]">
            <div className="z-[101] bg-[#F9F9F9] w-[60%] h-[65%] overflow-auto p-10 pt-8 rounded shadow-lg flex flex-col items-end gap-y-4">
                <button onClick={onClose} className="text-sm text-gray-700 hover:text-black cursor-pointer self-end">X</button>
                <h3 className="text-xl font-semibold mb-2 w-full border-b pb-2">Material Request</h3>

                <div className="overflow-y-auto w-full min-h-[70%] border border-[#0C2D49] rounded-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-center text-[#F9F9F9] bg-[#0C2D49] text-sm">
                                <th className="border-none px-4 py-4 text-center font-normal">Material</th>
                                <th className="border-none px-4 py-4 text-center font-normal">Qty Requested</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index} className="w-full hover:bg-[#F5F5F5]">
                                    <td>
                                        <select
                                            value={row.materialId}
                                            onChange={e => handleRowChange(index, 'materialId', e.target.value)}
                                            className="border-none w-full text-sm px-2 py-2 outline-none text-center"
                                        >
                                            <option value="" disabled>Select Material</option>
                                            {materials.map(m => (
                                                <option key={m.material_id} value={m.material_id}>
                                                    {m.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={row.qtyRequested}
                                            onChange={e => handleRowChange(index, 'qtyRequested', e.target.value)}
                                            className="border-none px-2 py-2 w-full outline-none text-center text-sm"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex gap-x-3 mt-2 self-end">
                    <button className="bg-[#0C2D49] text-white text-sm py-2 px-6 rounded" onClick={addRow}>Add Row</button>
                    <button className="bg-[#0C2D49] text-white text-sm py-2 px-6 rounded" onClick={handleSubmit}>Submit Request</button>
                </div>
            </div>
        </div>
    );
}


function ViewRequestModal({ request, onClose }) {
    const date = new Date(request.request_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#F9F9F9] w-[40%] h-[50%] p-6 rounded shadow-lg flex flex-col overflow-y-auto">
                <button
                    onClick={onClose}
                    className="text-sm text-gray-700 hover:text-black cursor-pointer self-end">
                    ✕
                </button>

                <h3 className="text-xl font-semibold mb-4 border-b border-b-[#0C2D49] pb-[5px]">Request Details</h3>

                <div className="flex justify-between gap-x-[15px] mb-4 text-sm">
                    <div><strong>Request ID:</strong> {request.id}</div>
                    <div><strong>Date:</strong> {date}</div>
                </div>

                <div className="overflow-y-auto min-h-[70%] border border-[#0C2D49] rounded-sm">
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
                            {request.entries.map((entry, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-3 text-center">{entry.material_name || 'N/A'}</td>
                                    <td className="px-4 py-3 text-center">{entry.qty_requested ?? 0}</td>
                                    <td className="px-4 py-3 text-center">{entry.qty_received ?? 0}</td>
                                    <td className="px-4 py-3 text-center">{entry.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
