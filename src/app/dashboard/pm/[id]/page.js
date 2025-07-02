'use client'

import { Sidebar } from '@/app/components/components';
import { pmTabs } from '@/app/data/data';
import { fetchProjects } from '@/app/dashboard/pm/[id]/data'; 
import { useEffect, useState } from 'react';

export default function ProjectManagerPage() {
    const [project, setProject] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const res = await fetchProjects();
                 if(!res.success) {
                    setErrorMessage('Failed to fetch data')
                    setTimeout(() => setErrorMessage(''), 3000);
                 } else {
                    setProject(res);
                 }
            } catch (err) {
                setErrorMessage('Something went wrong');
                setTimeout(() => setErrorMessage(''), 3000);
            }
        };
        loadProjects();
    }, []);

    console.log (project)
    return (
        <>
      <Sidebar tabs={pmTabs()} />

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {project ? (
        <>
          <h1>{project.projectid}</h1>
          <h1>{project.projectname}</h1>
          <h1>{project.location}</h1>
          <h1>{project.startdate}</h1>
          <h1>{project.enddate}</h1>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>

    );
}