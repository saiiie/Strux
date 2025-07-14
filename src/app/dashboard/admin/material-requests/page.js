'use client'

import { Sidebar, Card, CreateButton, SubmitButton, InputField } from '@/app/components/components';
import { adminTabs, requestsColumns } from '@/app/data/data';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const columns = requestsColumns();
    const [errorMessage, setErrorMessage] = useState('');
    const [requests, setRequests] = useState([]);

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [viewProject, setViewProject] = useState(null);
    const [createProj, setCreateProj] = useState(false);

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

            {/* {showDetailsModal && <ProjectDetails project={viewProject} onClose={() => setShowDetailsModal(false)} />};
            {createProj && <CreateProjModal onClose={() => setCreateProj(false)} />}; */}
        </>
    );
}

