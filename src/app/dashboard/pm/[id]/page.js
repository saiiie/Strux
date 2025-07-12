'use client'

import { Sidebar, Card, CreateButton } from '@/app/components/components';
import { pmTabs } from '@/app/data/data';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CirclePlus } from 'lucide-react';

export default function ProjectManagerPage() {
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logEntryDetails, setLogEntryDetails] = useState([]);
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
  
  const handleRowClick = async (log) => {
  setSelectedLog(log);
  console.log('Fetching log details for:', log);

  try {
    const res = await fetch(`/api/inventory_logs/log_entry/${log.id}`);
    const data = await res.json();
    console.log('Fetched log entries:', data);

    if (!Array.isArray(data)) {
      console.warn('Invalid log entry data:', data);
      setLogEntryDetails([]);
      return;
    }

    const enrichedData = await Promise.all(
  data.map(async (entry) => {
    const materialRes = await fetch(`/api/inventory_logs/materials/${entry.material_id}`); // Pass material_id
    const { name } = await materialRes.json();
    return {
      ...entry,
      material_name: name || 'Unknown Material',
    };
  })
);

    console.log('Enriched log entries:', enrichedData);
    setLogEntryDetails(enrichedData);
  } catch (error) {
    console.error('Error fetching log entries:', error);
    setLogEntryDetails([]);
  }
};

  return (
    <div className="flex h-screen w-screen m-0 p-0">
      <Sidebar tabs={pmTabs()} />
      <div className="flex flex-col m-0 p-[1.3em] h-[100%] w-[100%] gap-y-[20px] items-center">
        <h2 className="text-2xl font-semibold mb-1 flex items-center gap-x-[10px] self-start" >
          {project
            ? <>
                {project.projectname} <span className="text-gray-500 text-base align-top">P-{project.projectid}</span>
              </>
            : 'Loading project...'}
        </h2> 
        <Card
          columns={columns}
          data={logs}
          onRowClick={handleRowClick}
        />
        <CreateButton
          text='Enter New Log'
          svg={<CirclePlus size={16} color="#FBFBFB" />}
          onClick={() => {/* open modal logic make the button work*/}}
        />
        {/* Modal */}
        {selectedLog && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
      <h3 className="text-xl font-semibold mb-4">Inventory Log Details</h3>

      {/* Log Info */}
      <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
        <div><strong>Log ID:</strong> {selectedLog.id}</div>
        <div><strong>Date:</strong> {selectedLog.log_date}</div>
        <div><strong>Project:</strong> {project?.projectname || 'Loading...'}</div>
      </div>

      {/* Entries Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Material</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Beginning Qty</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Received</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Used</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Ending Qty</th>
            </tr>
          </thead>
          <tbody>
            {logEntryDetails.length > 0 ? (
              logEntryDetails.map((entry) => (
                <tr key={entry.entry_id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{entry.material_name || 'Unknown'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{entry.beginning_qty}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{entry.qty_received}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{entry.qty_used}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{entry.ending_qty}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No entries found for this log.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => {
          setSelectedLog(null);
          setLogEntryDetails([]);
        }}
      >
        Close
      </button>
    </div>
  </div>
)}
      </div>
    </div>
  );
}