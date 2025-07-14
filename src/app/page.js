'use client'

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Box, InputField, SubmitButton } from '@/app/components/components';
import loginUser from '@/lib/auth';

export default function LogInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      setErrorMessage('Please fill in all fields.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {

      const data = await loginUser(formData);

      if (!data.success) {
        setErrorMessage('Invalid user or password.');
        setTimeout(() => setErrorMessage(''), 3000);
      } else if (data.role === 'Admin') {
        router.push('/dashboard/admin/projects');
      } else if (data.role === 'Project Manager') {
        router.push(`/dashboard/pm/${data.userID}/inventory-logs`);
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <>
      <div className='flex h-screen w-screen m-0 p-0'>
        <Box className="bg-[#0C2D49] text-[#F5C434]">
          <div className="flex flex-col m-[1em] h-[25%] w-[50%] justify-center items-center min-w-fit min-h-fit">
            <div className="flex m-0 p-0 h-[100%] w-[90%] gap-x-1 items-center min-w-fit min-h-fit">
              <div className="m-0 p-0 relative h-[200px] w-[200px]">
                <Image src="/strux.png" alt="Strux Logo" fill className="object-contain" priority />
              </div>
              <div className="m-0 p-0 h-fit w-[60%] text-center text-[52px] font-extrabold font-[700] tracking-[3px]">
                STRUX
              </div>
            </div>
            <div className="h-fit w-[100%] text-[16px] text-center tracking-[1px]">Construction Inventory Management System</div>
          </div>
        </Box>

        <Box className="bg-[#FBFBFB] text-[#0C2D49]">
          <div className="flex flex-col gap-y-[5px] h-[45%] w-[80%] m-0 p-0 min-h-fit justify-center">
            <h1 className="h-fit w-100% p-0 m-0 text-[44px] font-extrabold">Authorized access only.</h1>
            <p className="w-[100%] p-0 m-0 text-[#888888] text-[16px]">Enter your credentials to continue.</p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-y-[15px] mt-4 m-0">
              <InputField
                label="User ID"
                name="username"
                placeholder="Enter your ID"
                value={formData.username}
                onChange={handleChange}
              />
              <InputField
                label="Password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="relative h-5 m-0 p-0">
                <p
                  className={`absolute h-fit text-sm text-red-600 transition-all duration-100 ${errorMessage ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  {errorMessage || ' '}
                </p>
              </div>
              <SubmitButton text="Continue" />
            </form>
          </div>
        </Box>
      </div>
    </>
  )
}
