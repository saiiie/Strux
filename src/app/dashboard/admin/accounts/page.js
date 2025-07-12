'use client'

import { Sidebar, Card, CreateButton, SubmitButton, InputField } from '@/app/components/components';
import { adminTabs, accountsColumns } from '@/app/data/data';
import { useState, useEffect } from 'react';
import { CirclePlus } from 'lucide-react';
import addAccount from "@/lib/accounts/add";

export default function DashboardPage() {
    const columns = accountsColumns();
    const [errorMessage, setErrorMessage] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [viewAccount, setViewAccount] = useState(null);
    const [createAcc, setCreateAcc] = useState(false);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await fetch('/api/accounts/accounts');
                const data = await response.json();
                setAccounts(data);
                console.log(data);
            } catch (error) {
                setErrorMessage(error);
                setTimeout(() => setErrorMessage(''), 3000);
            }
        }
        fetchAccounts();
    }, []);

    return (
        <>
            <div className='flex h-screen w-screen m-0 p-0'>
                <Sidebar tabs={adminTabs()} />
                <div className="flex flex-col m-0 p-[1.3em] h-[100%] w-[100%] gap-y-[20px] items-center">
                    <Card columns={columns} data={accounts}
                        onRowClick={(accounts) => {
                            setViewAccount(accounts);
                            setShowDetailsModal(true);
                        }} />
                    <CreateButton text='Create Account' svg={<CirclePlus size={16} color="#FBFBFB" />} onClick={() => setCreateAcc(true)} />
                </div>
            </div>

            {showDetailsModal && <ShowAccount account={viewAccount} onClose={() => setShowDetailsModal(false)} />};
            {createAcc && <CreateAccModal onClose={() => setCreateAcc(false)} />};
        </>
    );
}

const ShowAccount = ({ account, onClose }) => {
    const { username, password, projectname, name } = account;
    const [isActive, setIsActive] = useState(account.is_active);

    const handleChange = (e) => {
        setIsActive(e.target.value === 'true');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/accounts/deactivate', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    is_active: isActive
                }),
            });

            if (!response.ok) {
                console.error('failed to update');
            } else {
                console.log('account status updated');
                window.location.reload();
            }
        } catch (error) {
            console.error('error:', error);
        }
    };

    return (
        <div className="fixed top-0 left-0 z-[100] flex justify-center items-center h-screen w-screen bg-[rgba(0,0,0,0.3)]">
            <div className="z-[101] bg-white w-[45%] h-[40%] p-10 pt-8 rounded shadow-lg flex flex-col items-end">
                <button onClick={onClose} className="text-sm text-gray-700 hover:text-black cursor-pointer">X</button>
                <div className="w-full h-full mt-2">
                    <div className="flex justify-between items-center gap-x-[10px] h-fit w-full m-0 mb-5 p-0 border-b border-[rgba(0,0,0,0.6)]">
                        <h1 className="text-[22px] font-medium p-0 pb-[5px] m-0">Name: {name}</h1>
                    </div>
                    <div className="flex flex-col gap-y-[16px]">
                        <p className="font-light text-[17px]"><span className="font-medium">Project Assigned:</span> {projectname || 'N/A'}</p>
                        <p className="font-light text-[17px]"><span className="font-medium">Username:</span> {username}</p>
                        <p className="font-light text-[17px]"><span className="font-medium">Password:</span> {password}</p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-y-[10px] mt-4">
                            <label htmlFor="is_active" className="text-sm font-medium">Account Status</label>
                            <select
                                id="is_active"
                                value={String(isActive)}
                                onChange={handleChange}
                                className="px-2 py-2 border border-gray-300 rounded text-sm"
                            >
                                <option disabled value="">Select Project Manager</option>
                                <option value="true">Active</option>
                                <option value="false">Deactivated</option>
                            </select>
                            <SubmitButton text="Create Project" />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

}


function CreateAccModal({ onClose }) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: '',
        fname: '',
        lname: '',
    })

    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await fetch('/api/accounts/accounts');
                const data = await response.json();
                setAccounts(data);
            } catch (error) {
                setErrorMessage(error);
                setTimeout(() => setErrorMessage(''), 3000);
            }
        }
        fetchAccounts();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = ['username', 'password', 'fname', 'lname'];
        for (const field of requiredFields) {
            if (!formData[field]?.trim()) {
                return;
            }
        }

        try {
            const response = await addAccount(formData);
            if (response.success) {
                console.log(response);
                onClose();
            } else {
                console.error('Account creation failed:', response);
            }
        } catch (err) {
            console.error('Error while creating account:', err);
        }
    };

    return (
        <div className="fixed top-0 left-0 z-[100] flex justify-center items-center h-screen w-screen bg-[rgba(0,0,0,0.3)]">
            <div className="z-[101] bg-white w-[40%] h-[61%] p-6 rounded shadow-lg flex flex-col overflow-y-auto">
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
                        label="Create User ID"
                        name="username"
                        placeholder="Enter User ID"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <InputField
                        label="First Name"
                        name="fname"
                        placeholder="Enter First Name"
                        value={formData.fname}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Last Name"
                        name="lname"
                        placeholder="Enter Last Name"
                        value={formData.lname}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Create Password"
                        name="password"
                        placeholder="Enter Password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <label htmlFor="role" className="text-sm text-[#0C2D49] font-medium m-0">
                        Select Role
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={`px-2 py-2 border border-[#CCCCCC] text-sm focus:outline-none mb-6 
                        hover:shadow-[0_2px_4px_rgb(12_45_73_/_0.2)] transition-all ${formData.role === '' ? 'text-gray-400' : 'text-black'
                            }`}>
                        <option disabled value="">Select User Role</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Admin">Admin</option>
                    </select>
                    <SubmitButton text="Create Account" />
                </form>
            </div>
        </div>
    )
}