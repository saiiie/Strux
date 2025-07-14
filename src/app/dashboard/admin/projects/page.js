'use client'

import { Sidebar, Card, CreateButton, SubmitButton, InputField } from '@/app/components/components';
import { adminTabs, projectsColumns } from '@/app/data/data';
import { useState, useEffect } from 'react';
import { CirclePlus } from 'lucide-react';
import addProject from "@/lib/projects/add";

export default function Projects() {
    const columns = projectsColumns();
    const [errorMessage, setErrorMessage] = useState('');
    const [projects, setProjects] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [viewProject, setViewProject] = useState(null);
    const [createProj, setCreateProj] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            setErrorMessage(error.message || 'Something went wrong');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };


    return (
        <>
            <div className='flex h-screen w-screen m-0 p-0'>
                <Sidebar tabs={adminTabs()} />
                <div className="flex flex-col m-0 p-[1.3em] h-[100%] w-[100%] gap-y-[20px] items-center">
                    <Card columns={columns} data={projects}
                        onRowClick={(project) => {
                            setViewProject(project);
                            setShowDetailsModal(true);
                        }} />
                    <CreateButton text='Create Project' svg={<CirclePlus size={16} color="#FBFBFB" />} onClick={() => setCreateProj(true)} />
                </div>
            </div>

            {showDetailsModal && <ProjectDetails
                project={viewProject}
                onClose={() => setShowDetailsModal(false)}
                onProjectUpdated={fetchProjects}
            />
            };
            {createProj && <CreateProjModal onClose={() => setCreateProj(false)} onCreated={fetchProjects} />};
        </>
    );
}

function ProjectDetails({ project, onClose, onProjectUpdated }) {
    const [editableProject, setEditableProject] = useState(project);

    useEffect(() => {
        setEditableProject(project);
    }, [project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableProject(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Updated Project Data:", editableProject);

        try {
            const response = await fetch('/api/projects/changeDetails', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project: editableProject
                })
            })

            if (!response.ok) {
                console.error('failed to update');
            } else {
                console.log('project details updated');
                await onProjectUpdated();
            }
        } catch (error) {
            console.error('error: ', error);
        }


    };

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

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD for input type="date"
    };

    return (
        <div className="fixed top-0 left-0 z-[100] flex justify-center items-center h-screen w-screen bg-[rgba(0,0,0,0.3)]">
            <div className="z-[101] bg-white w-[45%] h-[70%] p-10 pt-8 rounded shadow-lg flex flex-col items-end overflow-y-auto">
                <button onClick={onClose} className="text-sm text-gray-700 hover:text-black cursor-pointer">X</button>
                <form onSubmit={handleSubmit} className="w-full h-full mt-2 flex flex-col gap-y-[16px]">
                    <div className="flex justify-between items-center gap-x-[10px] h-fit w-full m-0 mb-5 p-0 border-b border-[rgba(0,0,0,0.6)]">
                        <h1 className="text-[22px] font-medium p-0 pb-[5px] m-0">
                            <InputField
                                name="projectname"
                                value={editableProject.projectname || ''}
                                onChange={handleChange}
                                className="text-[22px] font-medium p-0 m-0 border-none focus:ring-0"
                            />
                        </h1>
                        {/* <Status status={status}/> */}
                    </div>
                    <label htmlFor="pmid" className="text-sm font-medium text-[#0C2D49]">
                        Project Manager
                    </label>
                    <select
                        id="pmid"
                        name="pmid"
                        value={editableProject.pmid || ''}
                        onChange={handleChange}
                        className={`px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none ${editableProject.pmid === '' ? 'text-gray-400' : 'text-black'
                            }`}
                    >
                        {managers.map((pm) => (
                            <option key={pm.pmid} value={pm.pmid}>
                                {pm.fname} {pm.lname}
                            </option>
                        ))}
                    </select>


                    <InputField
                        label="Project Location"
                        name="location"
                        value={editableProject.location || ''}
                        onChange={handleChange}
                    />
                    <InputField
                        type='date'
                        label="Start Date"
                        name="startdate"
                        value={formatDateForInput(editableProject.startdate)}
                        onChange={handleChange}
                    />
                    <InputField
                        type='date'
                        label="End Date"
                        name="enddate"
                        value={formatDateForInput(editableProject.enddate)}
                        onChange={handleChange}
                    />
                    <SubmitButton text="Update Project" />
                </form>
            </div>
        </div>
    );
}

function CreateProjModal({ onClose, onCreated }) {
    const [formData, setFormData] = useState({
        client: '',
        projectName: '',
        location: '',
        startdate: '',
        enddate: '',
        status: 'Ongoing',
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
                await onCreated();
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
            <div className="z-[101] bg-white w-[40%] h-[70%] p-6 rounded shadow-lg flex flex-col overflow-y-auto">
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

                    <label htmlFor="pmid" className="text-sm text-[#0C2D49] font-medium m-0">
                        Project Manager
                    </label>
                    <select
                        id="pmid"
                        name="pmid"
                        value={formData.pmid}
                        onChange={handleChange}
                        className={`px-2 py-2 border border-[#CCCCCC] text-sm focus:outline-none mb-6
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