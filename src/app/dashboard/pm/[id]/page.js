'use client'

import { Sidebar, Card, CreateButton } from '@/app/components/components';
import { pmTabs } from '@/app/data/data';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CirclePlus } from 'lucide-react';

export default function ProjectManagerPage() {
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const pmid = params.id;

  const columns = [
    { header: 'ID', accessor: 'id', className: 'text-left pl-6' },
    { header: 'Log Date', accessor: 'log_date', className: 'text-right pr-6' }
  ];

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch(`/api/projects/${pmid}`);
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setErrorMessage('Something went wrong');
        setTimeout(() => setErrorMessage(''), 3000);
      } finally {
        setIsLoading(false);
      }
    };
    const loadLogs = async () => {
      try {
        const res = await fetch(`/api/inventory_logs/pm/${pmid}`);
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        // Optionally handle error
      }
    };
    if (pmid) {
      loadProjects();
      loadLogs();
    }
  }, [pmid]);

  const project = projects[0];

  return (
    <div className="flex h-screen w-screen m-0 p-0">
      <Sidebar tabs={pmTabs()} />
      <div className="flex flex-col m-0 p-[1.3em] h-[100%] w-[100%] gap-y-[20px] items-center">
        {/* <div className="bg-white rounded-lg shadow p-8 w-full max-w-4xl"> */}
          <h2 className="text-2xl font-semibold mb-1 flex items-center gap-x-[10px] self-start" >
            {project
              ? <>
                  {project.projectname} <span className="text-gray-500 text-base align-top">P-{project.projectid}</span>
                </>
              : 'Loading project...'}
          </h2> 
          <Card columns={columns} data={logs} onRowClick={() => {}} />
          {/* <div className="flex justify-end mt-8"> */}
            <CreateButton
              text='Enter New Log'
              svg={<CirclePlus size={16} color="#FBFBFB" />}
              onClick={() => {/* open modal logic make the button work*/}}
            />
          </div>
        </div>
      // </div>
    // </div>
  );
}