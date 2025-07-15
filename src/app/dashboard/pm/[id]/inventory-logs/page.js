'use client'

import { Sidebar, Card, CreateButton } from '@/app/components/components';
import { pmTabs, pmLogsColumns, creatLogHeaders } from '@/app/data/data';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CirclePlus } from 'lucide-react';
import addLog from '@/lib/inventory/addLog';

export default function ProjectManagerPage() {
  const columns = pmLogsColumns();
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logEntryDetails, setLogEntryDetails] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [createLog, setCreateLog] = useState(false);
  const params = useParams();
  const pmid = params.id;

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch(`/api/projects/${pmid}`);
        const data = await res.json();
        setProjects(data);
      } catch {
        setErrorMessage('Something went wrong');
        setTimeout(() => setErrorMessage(''), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    const loadLogs = async () => {
      try {
        const res = await fetch(`/api/inventory_logs/pm/${pmid}/log`);
        const data = await res.json();
        setLogs(data);
      } catch {
        setErrorMessage('Something went wrong');
        setTimeout(() => setErrorMessage(''), 3000);
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
        <h2 className="text-2xl font-semibold mb-1 flex items-center gap-x-[10px] self-start">
          {project
            ? <>
              {project.projectname} <span className="text-gray-500 text-base align-top">P-{project.projectid}</span>
            </>
            : 'Loading project...'}
        </h2>

        <Card columns={columns} data={logs} onRowClick={(log) => setSelectedLog(log)} />

        <CreateButton
          text='Enter New Log'
          svg={<CirclePlus size={16} color="#FBFBFB" />}
          onClick={() => setCreateLog(true)}
        />

        {createLog && project && <CreateLogModal onClose={() => setCreateLog(false)} projectId={project.projectid} />}

        {selectedLog && (
          <LogDetailsModal
            log={selectedLog}
            projectName={project?.projectname}
            location={project?.location}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </div>
    </div>
  );
}

function CreateLogModal({ onClose, projectId }) {
  const headers = creatLogHeaders();
  const [materials, setMaterials] = useState([]);
  // const projectid = {projectId};
  const [rows, setRows] = useState([
    {
      materialId: '',
      beginningQty: '',
      qtyReceived: '',
      qtyUsed: '',
      endingQty: ''
    }
  ]);

  useEffect(() => {
    fetch('/api/materials')
      .then(res => res.json())
      .then(setMaterials)
      .catch(err => console.error('Failed to fetch materials:', err));
  }, []);

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows(prev => [
      ...prev,
      { materialId: '', beginningQty: '', qtyReceived: '', qtyUsed: '', endingQty: '' }
    ]);
  };

  const handleSubmit = async () => {
    try {
      const response = await addLog(projectId, rows);
      if (response.success) {
        onClose();
      } else {
        alert('Log creation failed');
      }
    } catch (err) {
      console.error('Error creating log:', err);
      alert('Something went wrong');
    }
  };

  return (
    <div className="fixed top-0 left-0 z-[100] flex justify-center items-center h-screen w-screen bg-[rgba(0,0,0,0.3)]">
      <div className="z-[101] bg-[#F9F9F9] w-[60%] h-[65%] overflow-auto p-10 pt-8 rounded shadow-lg flex flex-col items-end gap-y-4">
        <button onClick={onClose} className="text-sm text-gray-700 hover:text-black cursor-pointer self-end">X</button>
        <h3 className="text-xl font-semibold mb-2 w-full border-b pb-2">Enter Log Details</h3>

        <div className="overflow-y-auto min-h-[70%] border border-[#0C2D49] rounded-sm">
          <table className="w-full border-collapse">
            
            <thead>
              <tr className="text-center text-[#F9F9F9] bg-[#0C2D49] text-sm">
                {headers.map((title, index) => (
                  <th key={index} className="border-none px-4 py-4 text-center font-normal w-[20%]"> {title} </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-[#F5F5F5]">
                  <td>
                    <select
                      value={row.materialId}
                      onChange={e => handleRowChange(index, 'materialId', e.target.value)}
                      className="border-none w-full text-sm px-2 py-2 h-full outline-none text-center"
                    >
                      <option value="" disabled>Select Material</option>
                      {materials.map(material => (
                        <option key={material.material_id} value={material.material_id}>
                          {material.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td><input type="number" value={row.beginningQty} onChange={e => handleRowChange(index, 'beginningQty', e.target.value)} className="border-none px-2 py-3 w-full outline-none text-center text-sm" /></td>
                  <td><input type="number" value={row.qtyReceived} onChange={e => handleRowChange(index, 'qtyReceived', e.target.value)} className="border-none px-2 py-2 w-full outline-none text-center text-sm" /></td>
                  <td><input type="number" value={row.qtyUsed} onChange={e => handleRowChange(index, 'qtyUsed', e.target.value)} className="border-none px-2 py-2 w-full outline-none text-center text-sm" /></td>
                  <td><input type="number" value={row.endingQty} onChange={e => handleRowChange(index, 'endingQty', e.target.value)} className="border-none px-2 py-2 w-full outline-none text-center text-sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-x-3 m-0 p-0 mt-2 self-end">
          <button className="bg-[#0C2D49] text-[#F9F9F9] text-sm py-2 px-6 rounded cursor-pointer" onClick={addRow}>Add Row</button>

          <button className="bg-[#0C2D49] text-[#F9F9F9] text-sm py-2 px-6 rounded cursor-pointer" onClick={handleSubmit}>Submit Log</button>
        </div>
      </div>
    </div>
  );
}

function LogDetailsModal({ log, projectName, location, onClose }) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogEntries = async () => {
      try {
        const res = await fetch(`/api/inventory_logs/log_entry/${log.id}`);
        const data = await res.json();

        const enriched = await Promise.all(
          data.map(async (entry) => {
            const res = await fetch(`/api/inventory_logs/materials/${entry.material_id}`);
            const { name } = await res.json();
            return { ...entry, material_name: name || 'Unknown Material' };
          })
        );

        setEntries(enriched);
      } catch (error) {
        console.error('Failed to fetch log entry details:', error);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogEntries();
  }, [log]);
  const date = new Date(log.log_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#F9F9F9] w-[40%] h-[50%] p-6 rounded shadow-lg flex flex-col overflow-y-auto">
        <button
          onClick={onClose}
          className="text-sm text-gray-700 hover:text-black cursor-pointer self-end">
          X
        </button>

        <h3 className="text-xl font-semibold mb-4 border-b border-b-[#0C2D49] pb-[5px]">{projectName}: {location}</h3>
        <div className="flex justify-between gap-x-[15px] mb-4 text-sm">
          <div><strong>Log ID:</strong> {log.id}</div>
          <div><strong>Date:</strong> {date}</div>
        </div>

        <div className="overflow-y-auto min-h-[70%] border border-[#0C2D49] rounded-sm">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading entries...</div>
          ) : (
            <table className="min-w-full border-separate border-spacing-0 border-none text-sm">
              <thead>
                <tr className="bg-[#0C2D49] text-[#F9F9F9]">
                  <th className="border-none px-4 py-4 text-center font-normal">Material</th>
                  <th className="border-none px-4 py-4 text-center font-normal">Beginning Qty</th>
                  <th className="border-none px-4 py-4 text-center font-normal">Received</th>
                  <th className="border-none px-4 py-4 text-center font-normal">Used</th>
                  <th className="border-none px-4 py-4 text-center font-normal">Ending Qty</th>
                </tr>
              </thead>
              <tbody>
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <tr key={entry.entry_id}>
                      <td className="px-4 py-3 text-center">{entry.material_name}</td>
                      <td className="px-4 py-3 text-center">{entry.beginning_qty}</td>
                      <td className="px-4 py-3 text-center">{entry.qty_received}</td>
                      <td className="px-4 py-3 text-center">{entry.qty_used}</td>
                      <td className="px-4 py-3 text-center">{entry.ending_qty}</td>
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
          )}
        </div>
      </div>
    </div>
  );
}
