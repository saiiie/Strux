'use client'

import { Sidebar, Main, CreateProject } from '@/app/components/components';
import { adminTabs } from '@/app/data/data';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    // temporary data to see lang if the code worked delete lng after hehe
    const columns = [
        { header: 'Project ID', accessor: 'projectid' },
        { header: 'Name', accessor: 'projectname' },
        { header: 'Location', accessor: 'location' },
        // { header: 'Project Manager', accessor: 'pmid'}
        { header: 'Project Manager', accessor: 'project_manager_name' }
        // { header: 'Status', accessor: 'status' }
    ];

    const sampleData = [
        {
            project_id: 'P-25-02',
            name: 'Drainage Improvement',
            location: 'Mandaue City',
            manager: 'Engr. Maria Santos',
            status: 'Pending'
        },
        {
            project_id: 'P-25-03',
            name: 'Bridge Rehabilitation - Banilad',
            location: 'Lapu-Lapu City',
            manager: 'Engr. Roberto Villanueva',
            status: 'Completed'
        }
    ]

    const [errorMessage, setErrorMessage] = useState('');
    const [projects, setProjects] = useState([]);

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
                <Main columns={columns} data={projects} />
            </div>
        </>
    );
}