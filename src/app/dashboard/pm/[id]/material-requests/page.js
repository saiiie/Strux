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
                if (Array.isArray(data) && data.length > 0 && data[0]?.projectname) {
                    setProjectName(data[0].projectname);
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
            <div className="z-[101] bg-[#F9F9F9] w-[60%] h-[60%] overflow-auto p-10 pt-8 rounded shadow-lg flex flex-col items-end gap-y-4">
                <button onClick={onClose} className="text-sm text-gray-700 hover:text-black cursor-pointer self-end">X</button>
                <h3 className="text-xl font-semibold mb-2 w-full border-b pb-2">Material Request</h3>

                <div className="overflow-y-auto min-h-[70%] border border-[#0C2D49] rounded-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-center text-[#F9F9F9] bg-[#0C2D49] text-sm">
                                <th className="border-none px-4 py-4 text-center font-normal">Material</th>
                                <th className="border-none px-4 py-4 text-center font-normal">Qty Requested</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index} className="hover:bg-[#F5F5F5]">
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
    const date = new Date(request.request_date).toLocaleDateString();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.3)]">
            <div className="bg-white w-[700px] rounded-lg shadow-lg relative p-6 text-black">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Request Details</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-600 text-lg font-bold hover:text-black"
                    >
                        ✕
                    </button>
                </div>

                {/* Date Section */}
                <div className="mb-4">
                    <p className="text-sm text-gray-500">DATE</p>
                    <p className="font-medium">{date}</p>
                    <div className="w-full h-[1px] bg-black mt-2"></div>
                </div>

                {/* Table Header Row */}
                <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-700 border-b pb-2 mb-2">
                    <div>Material Name</div>
                    <div>Qty Requested</div>
                    <div>Qty Received</div>
                    <div>Status</div>
                </div>

                {/* Entry Rows */}
                {request.entries.map((entry, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 text-sm text-gray-800 py-2 border-b">
                        <div>{entry.material_name || 'N/A'}</div>
                        <div>{entry.qty_requested ?? 0}</div>
                        <div>{entry.qty_received ?? 0}</div>
                        <div>{entry.status}</div>
                    </div>
                ))}

                {/* Footer Button */}
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