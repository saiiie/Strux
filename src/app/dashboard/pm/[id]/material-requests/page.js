'use client';

import { Sidebar, Card, CreateButton } from '@/app/components/components';
import { pmTabs } from '@/app/data/data';
import { useEffect, useState, useCallback, memo } from 'react';
import { useParams } from 'next/navigation';
import { CirclePlus } from 'lucide-react';
import addLogEntry from '@/lib/inventory/log_entry/add';
import addInventoryLog from '@/lib/inventory/add';

// 🔁 Memoized Row Component — Only re-renders when its own data changes
const MaterialRow = memo(({ material, index, onChange }) => {
  return (
    <div key={material.id} className="flex px-4 py-3 text-sm">
      <input
        type="text"
        value={material.material}
        onChange={(e) => onChange(index, 'material', e.target.value)}
        className="w-1/5 bg-transparent outline-none"
      />
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={material.beginningQty}
        onChange={(e) =>
          onChange(index, 'beginningQty', e.target.value)
        }
        className="w-1/5 bg-transparent outline-none text-center"
      />
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={material.qtyReceived}
        onChange={(e) =>
          onChange(index, 'qtyReceived', e.target.value)
        }
        className="w-1/5 bg-transparent outline-none text-center"
      />
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={material.qtyUsed}
        onChange={(e) =>
          onChange(index, 'qtyUsed', e.target.value)
        }
        className="w-1/5 bg-transparent outline-none text-center"
      />
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={material.endingQty}
        onChange={(e) =>
          onChange(index, 'endingQty', e.target.value)
        }
        className="w-1/5 bg-transparent outline-none text-center"
      />
    </div>
  );
});

export default function ProjectManagerPage() {
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFormData, setModalFormData] = useState([
    {
      id: crypto.randomUUID(),
      material: '',
      beginningQty: 0,
      qtyReceived: 0,
      qtyUsed: 0,
      endingQty: 0,
    },
  ]);

  const params = useParams();
  const pmid = params.id;

  const columns = [
    { header: 'ID', accessor: 'id', className: 'text-left pl-6' },
    { header: 'Log Date', accessor: 'log_date', className: 'text-right pr-6' },
  ];

  // Load project and logs on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch(`/api/projects/${pmid}`);
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch {
        console.error('Failed to load projects.');
      }
    };

    const loadLogs = async () => {
      try {
        const res = await fetch(`/api/inventory_logs/pm/${pmid}`);
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch {
        console.error('Failed to load logs.');
      }
    };

    if (pmid) {
      loadProjects();
      loadLogs();
    }
  }, [pmid]);

  // Reset form when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setModalFormData([
        {
          id: crypto.randomUUID(),
          material: '',
          beginningQty: 0,
          qtyReceived: 0,
          qtyUsed: 0,
          endingQty: 0,
        },
      ]);
    }
  }, [isModalOpen]);

  const project = projects[0];

  const addNewRow = () => {
    setModalFormData(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        material: '',
        beginningQty: 0,
        qtyReceived: 0,
        qtyUsed: 0,
        endingQty: 0,
      },
    ]);
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...modalFormData];

    if (
      ['beginningQty', 'qtyReceived', 'qtyUsed', 'endingQty'].includes(field)
    ) {
      const parsed = parseInt(value);
      updated[index][field] = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    } else {
      updated[index][field] = value;
    }

    setModalFormData(updated);
  };

  const handleSubmit = async () => {
    try {
      const inventoryLogPayload = {
        log_date: new Date().toISOString().replace('T', ' ').replace('.000Z', '+00'),
        project_id: project?.projectid || null,
        project: project,
      };

      const logEntryPayload = modalFormData.map(material => ({
        material: material.material,
        beginning_qty: parseInt(material.beginningQty, 10) || 0,
        qty_received: parseInt(material.qtyReceived, 10) || 0,
        qty_used: parseInt(material.qtyUsed, 10) || 0,
        ending_qty: parseInt(material.endingQty, 10) || 0,
        project_id: project?.projectid || null,
        pm_id: pmid || null,
        log_date: new Date().toISOString(),
      }));

// ✅ Attach array of entries to the parent object
      inventoryLogPayload.log_entries = logEntryPayload;
      await addLogEntry(logEntryPayload);

      await addInventoryLog(inventoryLogPayload)

     

      alert('Log submitted successfully!');
      setIsModalOpen(false);

    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const CreateNewLogEntry = () => {
    return (
      isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.3)]">
          <form
            onSubmit={(e) => {
              e.preventDefault(); // prevent page reload
              handleSubmit();     // your existing submit logic
            }}
            className="bg-white w-[750px] h-[420px] rounded-lg shadow-lg relative flex flex-col p-6 text-black"
          >
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 text-lg font-bold hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* Table Header */}
            <div className="border border-gray-300 rounded-md flex-1 overflow-y-auto mb-5">
              <div className="flex bg-[#0A2C46] text-white font-semibold text-sm py-3 px-4 rounded-t">
                <div className="w-1/5">Material</div>
                <div className="w-1/5">Beginning Qty</div>
                <div className="w-1/5">Qty Received</div>
                <div className="w-1/5">Qty Used</div>
                <div className="w-1/5">Ending Qty</div>
              </div>

              {/* Table Rows */}
              {modalFormData.map((material, index) => (
                <MaterialRow
                  key={material.id}
                  material={material}
                  index={index}
                  onChange={handleMaterialChange}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-x-3">
              <button
                type="button"
                onClick={addNewRow}
                className="flex items-center gap-x-2 px-4 py-2 bg-[#0A2C46] text-white rounded-md hover:bg-[#083047] text-sm"
              >
                ➕ Add New Row
              </button>
              <button
                type="submit"
                className="flex items-center gap-x-2 px-4 py-2 bg-[#0A2C46] text-white rounded-md hover:bg-[#083047] text-sm"
              >
                ➕ Create New Log
              </button>
            </div>
          </form>
        </div>
      )
    );
  };

  return (
    <div className="flex h-screen w-screen">
      <Sidebar tabs={pmTabs()} />

      <div className="flex flex-col p-6 w-full gap-y-6 items-center">
        <h2 className="text-2xl font-semibold self-start">
          {project ? (
            <>
              {project.projectname}{' '}
              <span className="text-gray-500 text-base">P-{project.projectid}</span>
            </>
          ) : (
            'Loading project...'
          )}
        </h2>

        <Card columns={columns} data={logs} onRowClick={() => {}} />

        <CreateButton
          text="Enter New Log"
          svg={<CirclePlus size={16} color="#FBFBFB" />}
          onClick={() => setIsModalOpen(true)}
        />

        <CreateNewLogEntry />
      </div>
    </div>
  );
}