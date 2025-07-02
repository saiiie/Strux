'use client'

import { Sidebar } from '@/app/components/components';
import { pmTabs } from '@/app/data/data';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ProjectManagerPage() {
  const [projects, setProjects] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const pmid = params.id;
  let data;

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch(`/api/projects/${pmid}`);
        data = await res.json();

        setProjects(data);
      } catch (err) {
        setErrorMessage('Something went wrong');
        setTimeout(() => setErrorMessage(''), 3000);
      } finally {
        setIsLoading(false);
      }
    };
    if (pmid) {
      loadProjects();
    }
  }, [pmid]);
  return (
    <>
      <div className="flex m-0 p-0 h-[100vh] w-[100vw]">
        <Sidebar tabs={pmTabs()} />
        {!isLoading && !errorMessage && (
          <div>
            {projects.map((project) => (
              <div key={project.projectid} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                <h2>Project Name: {project.projectname}</h2>
                <p>ID: {project.projectid}</p>
                <p>Location: {project.location}</p>
                <p>Start Date: {new Date(project.startdate).toLocaleDateString()}</p>
                <p>End Date: {new Date(project.enddate).toLocaleDateString()}</p>
              </div>
            ))}
            {projects.length === 0 && <p>No projects found for this manager.</p>}
          </div>
        )}
      </div>
    </>
  );
}
