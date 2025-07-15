'use client'

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/app/components/components';
import { pmTabs } from '@/app/data/data'; 

export default function SettingsPage() { 

    const params = useParams();
    const pmid = parseInt(params.id); 

    const [errorMessage, setErrorMessage] = useState('');
    const [accountInfo, setAccountInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        const fetchAccounts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/accounts/accounts');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const accountFound = data.find(account => account.pmid === pmid);
                
                if (accountFound) {
                    setAccountInfo(accountFound);
                    console.log("Found Account Info:", accountFound);
                } else {
                    console.error(`Account with pmid ${pmid} not found.`);
                    setAccountInfo({}); 
                    setErrorMessage(`Account with ID ${pmid} not found. Please check the URL.`);
                }

            } catch (error) {
                console.error("Error fetching accounts:", error);
                setErrorMessage('Failed to load account data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        
        if (pmid) {
            fetchAccounts();
        } else {
            setIsLoading(false); 
        }

    }, [pmid]); 


    return (
        <div className="flex h-screen w-screen bg-gray-100">
            <Sidebar tabs={pmTabs(pmid)} />

            <div className="flex-1 p-8 overflow-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Account Settings</h1>

                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {errorMessage}</span>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <p className="text-gray-600 text-lg">Loading account details...</p>
                    </div>
                ) : (
                    Object.keys(accountInfo).length > 0 ? (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-600">Full Name:</label>
                                    <p className="text-gray-800 text-lg">{accountInfo.name}</p>
                                </div>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-600">Username:</label>
                                    <p className="text-gray-800 text-lg">{accountInfo.username}</p>
                                </div>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-600">Project Name:</label>
                                    <p className="text-gray-800 text-lg">
                                        {accountInfo.projectname || 'N/A (No project assigned)'}
                                    </p>
                                </div>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-600">PM ID:</label>
                                    <p className="text-gray-800 text-lg">{accountInfo.pmid}</p>
                                </div>
                            </div>
                            <div className="mt-8">
                                <button
                                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                                    onClick={() => alert("Edit functionality coming soon!")}
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
                            <p>No account information available.</p>
                            <p>Please ensure a valid Project Manager ID is provided in the URL.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}