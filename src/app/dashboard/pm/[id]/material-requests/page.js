'use client';

import { Sidebar, Card, CreateButton } from '@/app/components/components';
import { pmTabs, requestsPMColumns } from '@/app/data/data';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CirclePlus } from 'lucide-react';

// === MODAL FOR CREATING NEW REQUEST ===
function CreateNewRequestModal({ formData, setFormData, onClose, error, setError }) {
    const addNewRow = () => {
        setFormData([...formData, { material: '', requestedQty: 0 }]);
    };

    const handleChange = (index, field, value) => {
        const updated = [...formData];
        if (field === 'requestedQty') {
            updated[index][field] = Math.max(0, parseInt(value, 10) || 0);
        } else {
            updated[index][field] = value;
        }
        setFormData(updated);

        if (
            field === 'requestedQty' &&
            updated[index].material.toLowerCase() === 'gravel' &&
            updated[index][field] < 50
        ) {
            setError('Minimum quantity of 50 for Gravel required!');
        } else {
            setError('');
        }
    };

    const handleSubmit = () => {
        console.log('Submitting request:', formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.3)]">
            <div className="bg-white w-[750px] h-[420px] rounded-lg shadow-lg relative flex flex-col p-6 text-black">
                <div className="flex justify-end mb-4">
                    <button
                        onClick={onClose}
                        className="text-gray-600 text-lg font-bold hover:text-black"
                    >
                        ✕
                    </button>
                </div>

                <div className="border border-gray-300 rounded-md flex-1 overflow-y-auto mb-5">
                    <div className="flex bg-[#0A2C46] text-white font-semibold text-sm py-3 px-4 rounded-t">
                        <div className="w-1/2 text-left">Material</div>
                        <div className="w-1/2 text-right">Requested Quantity</div>
                    </div>

                    {formData.map((item, index) => (
                        <div key={index} className="flex px-4 py-3 text-sm">
                            <input
                                type="text"
                                value={item.material}
                                onChange={(e) => handleChange(index, 'material', e.target.value)}
                                className="w-1/2 bg-transparent outline-none"
                            />
                            <input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                value={item.requestedQty}
                                onChange={(e) => handleChange(index, 'requestedQty', e.target.value)}
                                className="w-1/2 bg-transparent outline-none text-right"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-end gap-y-2">
                    {error && <span className="text-sm text-red-500 self-start pl-1">{error}</span>}
                    <div className="flex gap-x-3">
                        <button
                            type="button"
                            onClick={addNewRow}
                            className="flex items-center gap-x-2 px-4 py-2 bg-[#0A2C46] text-white rounded-md hover:bg-[#083047] text-sm"
                        >
                            Add New Row
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="flex items-center gap-x-2 px-4 py-2 bg-[#0A2C46] text-white rounded-md hover:bg-[#083047] text-sm"
                        >
                            Submit Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// === MODAL FOR VIEWING SELECTED REQUEST ===
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

// === MAIN PAGE COMPONENT ===
export default function MaterialRequestsPage() {
    const columns = requestsPMColumns(); // Use the exported function
    const [materialRequests, setMaterialRequests] = useState([]);
    const [projectName, setProjectName] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null); // For viewing details
    const [error, setError] = useState('');
    const [formData, setFormData] = useState([{ material: '', requestedQty: 0 }]);

    const params = useParams();
    const pmid = parseInt(params.id);

    useEffect(() => {
        const fetchMaterialRequests = async () => {
            try {
                const res = await fetch(`/api/material-requests/${pmid}`);
                const data = await res.json();
                setMaterialRequests(data);
                if (Array.isArray(data) && data.length > 0 && data[0]?.projectname) {
                    setProjectName(data[0].projectname);
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (pmid) fetchMaterialRequests();
    }, [pmid]);

    return (
        <div className="flex h-screen w-screen">
            <Sidebar tabs={pmTabs( pmid )} />

            <div className="flex flex-col p-6 w-full gap-y-6 items-center">
                <h2 className="text-2xl font-semibold self-start">
                    {projectName || 'Loading project...'}
                </h2>

                <Card
                    columns={columns}
                    data={materialRequests}
                    onRowClick={(row) => setSelectedRequest(row)} // Open modal on click
                />

                <CreateButton
                    text="Create New Request"
                    svg={<CirclePlus size={16} color="#FBFBFB" />}
                    onClick={() => setIsCreateModalOpen(true)}
                />

                {/* Modals */}
                {isCreateModalOpen && (
                    <CreateNewRequestModal
                        formData={formData}
                        setFormData={setFormData}
                        onClose={() => setIsCreateModalOpen(false)}
                        error={error}
                        setError={setError}
                    />
                )}

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