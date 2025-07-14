'use client';

import { Sidebar, Card, CreateButton } from '@/app/components/components';
import { pmTabs } from '@/app/data/data';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CirclePlus } from 'lucide-react';

export default function MaterialRequestsPage() {
    const [materialRequests, setMaterialRequests] = useState([]);
    const [projectName, setProjectName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState([
        { material: '', requestedQty: 0 },
    ]);
    const [error, setError] = useState('');

    const params = useParams();
    const pmid = params.id;

    const columns = [
        { header: 'ID', accessor: 'request_id', className: 'text-left pl-6' },
        { header: 'Date Requested', accessor: 'request_date', className: 'text-right pr-6' },
        { header: 'Status', accessor: 'status', className: 'text-right pr-6' },
    ];

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

        fetchMaterialRequests();
    }, [pmid]);

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

        if (field === 'requestedQty' && updated[index].material.toLowerCase() === 'gravel' && updated[index][field] < 50) {
            setError('Minimum quantity of 50 for Gravel required!');
        } else {
            setError('');
        }
    };

    const handleSubmit = () => {
        console.log('Submitting request:', formData);
        setIsModalOpen(false);
    };

    const CreateNewRequestModal = () => (
        isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.3)]">
                <div className="bg-white w-[750px] h-[420px] rounded-lg shadow-lg relative flex flex-col p-6 text-black">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setIsModalOpen(false)}
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
                                ➕ Add New Row
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="flex items-center gap-x-2 px-4 py-2 bg-[#0A2C46] text-white rounded-md hover:bg-[#083047] text-sm"
                            >
                                ➕ Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    );

    return (
        <div className="flex h-screen w-screen">
            <Sidebar tabs={pmTabs()} />

            <div className="flex flex-col p-6 w-full gap-y-6 items-center">
                <h2 className="text-2xl font-semibold self-start">
                    {projectName || 'Loading project...'}
                </h2>

                <Card columns={columns} data={materialRequests} onRowClick={() => { }} />

                <CreateButton
                    text="Create New Request"
                    svg={<CirclePlus size={16} color="#FBFBFB" />}
                    onClick={() => setIsModalOpen(true)}
                />

                <CreateNewRequestModal />
            </div>
        </div>
    );
}