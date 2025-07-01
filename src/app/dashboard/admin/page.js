'use client'

import { Sidebar, Main, CreateProject } from '@/app/components/components';
import { adminTabs } from '@/app/data/data';

export default function DashboardPage() {
    // temporary data to see lang if the code worked delete lng after hehe
    const columns = [
        { header: 'Project ID', accessor: 'project_id' },
        { header: 'Name', accessor: 'name' },
        { header: 'Location', accessor: 'location' },
        { header: 'Project Manager', accessor: 'manager' },
        { header: 'Status', accessor: 'status' }
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

    return (
        <>
            <div className='flex h-screen w-screen m-0 p-0'>
                <Sidebar tabs={adminTabs()} />
                <Main columns={columns} data={sampleData} />
            </div>
        </>
    );
}