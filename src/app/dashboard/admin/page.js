'use client'

import { Sidebar, Card, CreateProject, ProjectDetails, SubmitButton, InputField } from '@/app/components/components';
import { adminTabs, projectsColumns } from '@/app/data/data';
import { useState, useEffect } from 'react';
import { CirclePlus } from 'lucide-react';
import addProject from "@/lib/projects/add";

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
                    <CreateProject text='Create Project' svg={<CirclePlus size={16} color="#152C47" />} onClick={() => setCreateProj(true)} />
                </div>
            </div>

            {showDetailsModal && <ProjectDetails project={viewProject} onClose={() => setShowDetailsModal(false)} />};
            {createProj && <CreateProjModal onClose={() => setCreateProj(false)} />};
        </>
    );
}

function CreateProjModal({ onClose }) {
    const [formData, setFormData] = useState({
        client: '',
        projectName: '',
        location: '',
        startdate: '',
        enddate: '',
        status: '',
        pmid: '',
    });


    const [managers, setManagers] = useState([]);

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const response = await fetch('/api/projects/projectManagers');
                const data = await response.json();
                setManagers(data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchManagers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.projectName.trim()) {
            return;
        }

        try {
            const response = await addProject(formData);
            if (response.success) {
                console.log(response);
                onClose();
            } else {
                console.error('Project creation failed:', response);
            }
        } catch (err) {
            console.error('Error while creating project:', err);
        }
    };

    return (
        <div className="fixed top-0 left-0 z-[100] flex justify-center items-center h-screen w-screen bg-[rgba(0,0,0,0.3)]">
            <div className="z-[101] bg-white w-[40%] h-[65%] p-6 rounded shadow-lg flex flex-col">
                <button
                    onClick={onClose}
                    className="text-sm text-gray-700 hover:text-black cursor-pointer self-end"
                >
                    X
                </button>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-y-[15px] mt-4 m-0"
                >

                    <InputField
                        label="Client"
                        name="client"
                        placeholder="Enter Client Name"
                        value={formData.client}
                        onChange={handleChange}
                    />

                    <InputField
                        label="Project Name"
                        name="projectName"
                        placeholder="Enter Project Name"
                        value={formData.projectName}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Project Location"
                        name="location"
                        placeholder="Enter Location"
                        value={formData.location}
                        onChange={handleChange}
                    />

                    <InputField
                        type='date'
                        label="Start Data"
                        name="startdate"
                        placeholder="Enter Start Date"
                        value={formData.startdate}
                        onChange={handleChange}
                    />

                    <InputField
                        type='date'
                        label="End Date"
                        name="enddate"
                        placeholder="Enter End Date"
                        value={formData.enddate}
                        onChange={handleChange}
                    />

                    <label htmlFor="status" className="text-sm text-[#0C2D49] font-medium">
                        Project Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className={`px-2 py-2 border border-[#CCCCCC] text-sm focus:outline-none 
                        hover:shadow-[0_2px_4px_rgb(12_45_73_/_0.2)] transition-all ${formData.pmid === '' ? 'text-gray-400' : 'text-black'
                            }`}>
                        <option disabled value="">Select Status</option>
                        <option value='Ongoing'>Ongoing</option>
                        <option value='Completed'>Completed</option>
                        <option value='Cancelled'>Cancelled</option>
                    </select>

                    <label htmlFor="pmid" className="text-sm text-[#0C2D49] font-medium">
                        Project Manager
                    </label>
                    <select
                        id="pmid"
                        name="pmid"
                        value={formData.pmid}
                        onChange={handleChange}
                        className={`px-2 py-2 border border-[#CCCCCC] text-sm focus:outline-none 
                        hover:shadow-[0_2px_4px_rgb(12_45_73_/_0.2)] transition-all ${formData.pmid === '' ? 'text-gray-400' : 'text-black'
                            }`}>
                        <option disabled value="">Select Project Manager</option>
                        {managers.map((pm) => (
                            <option key={pm.pmid} value={pm.pmid}>
                                {pm.fname} {pm.lname}
                            </option>
                        ))}
                    </select>
                    <SubmitButton text="Create Project" />
                </form>
            </div>
        </div>
    );
}