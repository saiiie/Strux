'use client'

import { Sidebar, Card, CreateButton, SubmitButton, InputField } from '@/app/components/components';
import { adminTabs, projectsColumns } from '@/app/data/data';
import { useState, useEffect } from 'react';
import { CirclePlus } from 'lucide-react';
import addProject from "@/lib/projects/add";
import { useRouter } from 'next/navigation';

export default function Projects() {
    const columns = projectsColumns();
    const [errorMessage, setErrorMessage] = useState('');
    const [projects, setProjects] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [viewProject, setViewProject] = useState(null);
    const [createProj, setCreateProj] = useState(false);
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        setCurrentUser(storedUser);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!currentUser && !loading && currentUser !== 'admin') {
            router.push('/');
        }
    }, [currentUser, loading]);

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

    if (!loading && currentUser !== 'admin') { return null; }

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
                console.error('Failed to update');
            } else {
                console.log('Project details updated');
                await onProjectUpdated();
                onClose();
            }
        } catch (error) {
            console.error('error: ', error);
        }


    };

    const [managers, setManagers] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const managersRes = await fetch('/api/projects/projectManagers');
                const managersData = await managersRes.json();
                setManagers(managersData);

                const projectsRes = await fetch('/api/projects');
                const projectsData = await projectsRes.json();
                setProjects(projectsData);

            } catch (err) {
                console.error('Error fetching managers or projects:', err);
            }
        };

        fetchData();
    }, []);

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    return (
        <div className="fixed top-0 left-0 z-[100] flex justify-center items-center h-screen w-screen bg-[rgba(0,0,0,0.3)]">
            <div className="z-[101] bg-white w-[45%] h-[70%] p-10 pt-8 rounded shadow-lg flex flex-col items-end overflow-y-auto">
                <button onClick={onClose} className="text-sm text-gray-700 hover:text-black cursor-pointer">X</button>
                <form onSubmit={handleSubmit} className="w-full h-full mt-2 flex flex-col gap-y-[16px]">
                    <div className="flex h-fit w-full m-0 mb-2 py-1 border-b border-[rgba(0,0,0,0.6)]">
                        <input
                            type="text"
                            name="projectname"
                            value={editableProject.projectname || ''}
                            onChange={handleChange}
                            className="text-3xl font-semibold p-0 m-0 border-none bg-transparent focus:outline-none focus:ring-0"
                        />
                    </div>

                    <div className="flex flex-col gap-y-[5px] h-fit w-full m-0 p-0">
                        <label htmlFor="pmid" className="text-sm text-[#0C2D49] font-medium m-0">
                            Project Manager
                        </label>
                        <select
                            id="pmid"
                            name="pmid"
                            value={editableProject.pmid || ''}
                            onChange={handleChange}
                            className={`px-3 py-2 border border-[#CCCCCC] text-sm focus:outline-none 
                                        hover:shadow-[0_2px_4px_rgb(12_45_73_/_0.2)] transition-all 
                                        ${editableProject.pmid === '' ? 'text-gray-400' : 'text-black'} cursor-pointer
                            `}
                        >
                            {managers.map(pm => {
                                const isUnavailable =
                                    editableProject.pmid !== pm.pmid &&
                                    projects.some(proj => proj.pmid === pm.pmid && proj.status === 'Ongoing');

                                return (
                                    <option key={pm.pmid} value={pm.pmid} disabled={isUnavailable}>
                                        {pm.fname} {pm.lname} {isUnavailable ? '(Unavailable)' : ''}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

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

                    <div className="flex flex-col gap-y-[5px] w-full m-0 p-0 mb-4">
                        <label htmlFor="status" className="text-sm text-[#0C2D49] font-medium m-0">Project Status:</label>
                        <select
                            id="status"
                            value={editableProject.status || ''}
                            onChange={handleChange}
                            name='status'
                            className="px-3 py-2 border border-[#CCCCCC] text-sm focus:outline-none 
                                    hover:shadow-[0_2px_4px_rgb(12_45_73_/_0.2)] transition-all"
                        >
                            <option disabled value="">Select Project Status</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

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

    // const [managers, setManagers] = useState([]);
    // useEffect(() => {
    //     const fetchManagers = async () => {
    //         try {
    //             const response = await fetch('/api/projects/projectManagers');
    //             const data = await response.json();
    //             setManagers(data);
    //         } catch (err) {
    //             console.log(err);
    //         }
    //     };
    //     fetchManagers();
    // }, []);

    const [managers, setManagers] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const managersRes = await fetch('/api/projects/projectManagers');
                const managersData = await managersRes.json();
                setManagers(managersData);

                const projectsRes = await fetch('/api/projects');
                const projectsData = await projectsRes.json();
                setProjects(projectsData);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
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
            <div className="z-[101] bg-white w-[45%] h-[76%] p-10 rounded shadow-lg flex flex-col overflow-y-auto">
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
                    <div className="flex h-fit w-full m-0 py-1 border-b border-[rgba(0,0,0,0.6)]">
                        <h3 className="text-2xl font-semibold p-0 m-0">Enter Details</h3>
                    </div>

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

                    <div className="flex flex-col gap-y-[5px] w-full m-0 p-0 mb-2">
                        <label htmlFor="pmid" className="text-sm text-[#0C2D49] font-medium m-0">
                            Project Manager
                        </label>
                        <select
                            id="pmid"
                            name="pmid"
                            value={formData.pmid}
                            onChange={handleChange}
                            className={`px-2 py-2 border border-[#CCCCCC] text-sm focus:outline-none
                                        hover:shadow-[0_2px_4px_rgb(12_45_73_/_0.2)] transition-all 
                                        ${formData.pmid === '' ? 'text-black' : 'text-gray-400'}
                            `}>
                            <option disabled value="">Select Project Manager</option>
                            {managers.map((pm) => {
                                const isUnavailable = projects.some(
                                    (proj) => proj.pmid === pm.pmid && proj.status === 'Ongoing'
                                );

                                return (
                                    <option key={pm.pmid} value={pm.pmid} disabled={isUnavailable}>
                                        {pm.fname} {pm.lname} {isUnavailable ? '(Unavailable)' : ''}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <SubmitButton text="Create Project" />
                </form>
            </div>
        </div>
    );
}