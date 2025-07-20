'use client'

import { Sidebar, Card, CreateButton, SubmitButton, InputField } from '@/app/components/components';
import { adminTabs, accountsColumns } from '@/app/data/data';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CirclePlus } from 'lucide-react';
import addAccount from "@/lib/accounts/add";

export default function DashboardPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const columns = accountsColumns();
    const [errorMessage, setErrorMessage] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [viewAccount, setViewAccount] = useState({});
    const [createAcc, setCreateAcc] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        setCurrentUser(storedUser);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading && currentUser !== 'admin') {
            router.push('/');
        }
    }, [currentUser, loading]);

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

    if (!loading && currentUser !== 'admin') { return null; }


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

            {showDetailsModal && <ShowAccount account={viewAccount} onClose={() => setShowDetailsModal(false)} />}
            {createAcc && <CreateAccModal onClose={() => setCreateAcc(false)} />}
        </>
    );
}

const ShowAccount = ({ account, onClose }) => {
    const { username, password, projectname, name } = account;
    const [isActive, setIsActive] = useState(account.is_active);

    const decodePassword = (bufferObj) => {
        if (!bufferObj || !bufferObj.data) return '';
        return String.fromCharCode(...bufferObj.data);
    };

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
            <div className="z-[101] bg-[#F9F9F9] w-[45%] h-[50%] p-10 pt-8 rounded shadow-lg flex flex-col items-end">
                <button onClick={onClose} className="text-sm text-gray-700 hover:text-black cursor-pointer">X</button>
                <div className="w-full h-full mt-2">
                    <div className="flex justify-between items-center gap-x-[10px] h-fit w-full m-0 mb-5 p-0 border-b border-[rgba(0,0,0,0.6)]">
                        <p className="text-[22px] font-normal p-0 pb-[5px] m-0"><span className="font-medium">Name:</span> {name}</p>
                    </div>
                    <div className="flex flex-col gap-y-[16px]">
                        <p className="font-light text-base"><span className="font-medium">Project Assigned:</span> {projectname || 'N/A'}</p>
                        <p className="font-light text-base"><span className="font-medium">Username:</span> {username}</p>
                        <p className="font-light text-base">
                            <span className="font-medium">Password:</span> {decodePassword(password)}
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-y-[10px] mt-0">
                            <label htmlFor="is_active" className="text-base font-medium top-0">Account Status:</label>
                            <select
                                id="is_active"
                                value={String(isActive)}
                                onChange={handleChange}
                                disabled={!!projectname}
                                className="px-2 py-2 border border-gray-300 rounded text-sm mb-4"
                            >
                                <option disabled value="">Select Project Manager</option>
                                <option value="true">Active</option>
                                <option value="false">Deactivated</option>
                            </select>

                            <SubmitButton text="Submit Changes" disabled={!!projectname} />
                        </form>

                        {projectname && (
                                <p className="text-sm text-red-500 mb-0 mt-1">
                                    You can't deactivate this account because they are assigned to a project.
                                </p>
                            )}

                        {!projectname && (<p className="text-sm text-[#7AAF60] mb-0 mt-1">Project Manager available for assignment.</p>)}
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
        confirmPassword: '',
        role: 'Project Manager',
        fname: '',
        lname: '',
    });

    const [accounts, setAccounts] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await fetch('/api/accounts/accounts');
                const data = await response.json();
                setAccounts(data);
            } catch (error) {
                setErrorMessage('Failed to load accounts.');
                setTimeout(() => setErrorMessage(''), 3000);
            }
        };
        fetchAccounts();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = ['username', 'password', 'confirmPassword', 'fname', 'lname'];
        for (const field of requiredFields) {
            if (!formData[field]?.trim()) {
                setErrorMessage('Please fill in all required fields.');
                setTimeout(() => setErrorMessage(''), 3000);
                return;
            }
        }

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match.');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        const isDuplicate = accounts.some(acc => acc.username === formData.username);
        if (isDuplicate) {
            setErrorMessage('Username already exists. Please choose another.');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        try {
            const { confirmPassword, ...accountData } = formData;
            const response = await addAccount(accountData);
            if (response.success) {
                onClose();
            } else {
                setErrorMessage('Something went wrong. Please try again.');
                setTimeout(() => setErrorMessage(''), 3000);
            }
        } catch (err) {
            console.error('Error while creating account:', err);
            setErrorMessage('Something went wrong. Please try again.');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    return (
        <div className="fixed top-0 left-0 z-[100] flex justify-center items-center h-screen w-screen bg-[rgba(0,0,0,0.3)]">
            <div className="z-[101] bg-white w-[45%] h-[69%] p-10 rounded shadow-lg flex flex-col overflow-y-auto">
                <button
                    onClick={onClose}
                    className="text-sm text-gray-700 hover:text-black cursor-pointer self-end"
                >
                    X
                </button>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-y-[15px] mt-2 m-0"
                >
                    <div className="h-fit w-full m-0 mb-2 px-1 border-b border-[rgba(0,0,0,0.6)]">
                        <h3 className="text-3xl font-semibold p-0 m-0">Enter Account Details</h3>
                    </div>

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
                        type="password"
                        placeholder="Enter Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <div className="flex flex-col gap-y-[5px] h-fit w-full m-0 p-0 mb-3">
                        <label htmlFor="confirmPassword" className="text-sm text-[#0C2D49] font-medium m-0">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            placeholder="Re-enter Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="px-3 py-2 border border-[#CCCCCC] text-sm focus:outline-none hover:shadow-[0_2px_4px_rgb(12_45_73_/_0.2)] transition-all"
                        />
                    </div>

                    <SubmitButton text="Create Account" />
                </form>
                
                <div className="relative h-fit m-0 mt-4">
                        <p className={`absolute text-sm text-red-600 transition-all duration-200 ${errorMessage ? 'opacity-100' : 'opacity-0'}`}>
                            {errorMessage || ' '}
                        </p>
                </div>
            </div>
        </div>
    );
}