'use client'

import { Sidebar, Card, CreateButton, SubmitButton, InputField } from '@/app/components/components';
import { adminTabs, projectsColumns } from '@/app/data/data';
import { useState, useEffect } from 'react';
import { CirclePlus } from 'lucide-react';

export default function DashboardPage() {
    const columns = projectsColumns();
    const [errorMessage, setErrorMessage] = useState('');
    const [projects, setProjects] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [viewProject, setViewProject] = useState(null);
    const [createProj, setCreateProj] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/projects');
                const data = await response.json();
                setProjects(data);
            } catch (error) {
                setErrorMessage(error);
                setTimeout(() => setErrorMessage(''), 3000);
            }
        }
        fetchProjects();
    }, []);

    return (
        <>
            <div className='flex h-screen w-screen m-0 p-0'>
                <Sidebar tabs={adminTabs()} />
                <div className="flex flex-col m-0 p-[1.3em] h-[100%] w-[100%] gap-y-[20px] items-center">
                    <Card columns={columns} data={projects}
                        onRowClick={(projects) => {
                            setViewProject(projects);
                            setShowDetailsModal(true);
                        }} />
                    <CreateButton text='Create Project' svg={<CirclePlus size={16} color="#FBFBFB" />} onClick={() => setCreateProj(true)} />
                </div>
            </div>

            {/* {showDetailsModal && <ProjectDetails project={viewProject} onClose={() => setShowDetailsModal(false)} />};
            {createProj && <CreateProjModal onClose={() => setCreateProj(false)} />}; */}
        </>
    );
}
