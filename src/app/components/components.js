import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Box({ children, className }) {
  return (
    <div className={`flex flex-col h-screen w-1/2 m-0 p-[1em] justify-center items-center ${className}`}>
      {children}
    </div>
  )
}

export function InputField({ label, type = "text", name, placeholder, value, onChange }) {
  return (
    <div className="flex flex-col gap-y-[5px] w-full m-0 p-0">
      <label htmlFor={name} className="text-sm text-[#0C2D49] font-medium"> {label} </label>
      <input
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="px-3 py-2 border border-[#CCCCCC] text-sm focus:outline-none 
        hover:shadow-[0_2px_4px_rgb(12_45_73_/_0.2)] transition-all"
      />
    </div>
  )
}

export function SubmitButton({ text }) {
  return (
    <button
      type="submit"
      className="py-2 bg-[#0C2D49] text-[#FBFBFB] font-medium rounded-md
                hover:text-[#0C2D49] hover:bg-[#FBFBFB]
                hover:shadow-[0_2px_4px_rgb(12_45_73_/_0.2)]
                transition-all mt-0">
      {text}
    </button>
  )
}

export function Sidebar({ tabs }) {
  return (
    <div className="flex flex-col sticky items-center m-0 p-[1em] h-[100vh] w-[20%] gap-y-[20px] bg-[#0C2D49] min-h-fit min-w-fit">
      <div className="m-0 p-[1em]">
        <Image src="/strux.png" alt="Strux Logo" height={50} width={50} className="object-contain" />
      </div>

      {tabs.map((tab, i) => (
        <SidebarTab key={i} label={tab.label} svg={tab.svg} href={tab.href} />
      ))}
    </div>
  )
}

function SidebarTab({ label, svg, href }) {
  return (
    <Link href={href} className="p-0 m-0 h-fit w-[95%]">
      <div className="
            flex justify-left items-center m-0 p-[.8em] w-[100%] h-fit cursor-pointer gap-x-[15px]
            rounded-md hover:bg-[#FBFBFB]/20 transition-all
            ">
        {svg}
        <span className="text-[16px] text-[#FBFBFB] font-medium">{label}</span>
      </div>
    </Link>
  )
}

export function Card({ columns, data, onRowClick }) {
  return (
    <>
      <div className="flex flex-col m-0 p-[1.5em] gap-y-[20px] h-[95%] w-[100%] border border-[#0C2D4933] rounded-md bg-[#FFFFFF]">
        <p className="p-[1em] bg-[rgba(58,138,189,0.2)]">Reserved Space for Search Filter (???)</p>
        <Table columns={columns} data={data} onRowClick={onRowClick} />
      </div>
    </>
  )
}

function Table({ columns, data, onRowClick = { onRowClick } }) {
  console.log({ data });

  return (
    <div
      className="grid w-full border border-transparent rounded-md bg-white overflow-y-auto scrollbar-thin"
      style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>

      {columns.map((col, index) => (
        <div key={`header-${index}`} className="p-[14px] text-[16px] text-[rgba(0,0,0,0.5)] bg-[rgba(58,138,189,0.2)] text-center">
          {col.header}
        </div>
      ))}

      {data.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="contents group cursor-pointer" onClick={() => onRowClick(row)}>
          {columns.map((col, colIndex) => (
            col.accessor === 'status' ? (
              <Status key={`cell-${rowIndex}-${colIndex}`} status={row[col.accessor]} style=' ' />
            ) : (
              <Cell key={`cell-${rowIndex}-${colIndex}`} data={row[col.accessor]} />
            )
          ))}
        </div>
      ))}
    </div>
  );
}

function Cell({ data }) {
  return (
    <div className="flex items-center justify-center m-0 p-[12px] pt-[16px] pb-[16px] text-[14px] text-[rgba(0,0,0,0.8)] group-hover:bg-[#FAFDFF] transition-colors">
      {data}
    </div>
  )
}

function Status({ status, style = '' }) {
  let color;
  status == 'Ongoing' ? color = '#e7f3fc'
    : status == 'Completed' ? color = '#eefee2'
      : color = '#fae3e3';

  return (
    <div className="flex justify-center items-center m-0 p-[12px] pt-[16px] pb-[16px] group-hover:bg-[#FAFDFF] transition-colors">
      <div className="h-fit w-[75%] p-[.5em] text-[14px] text-center text-[rgba(0,0,0,0.6)] rounded-sm"
        style={{ backgroundColor: color }}>
        {status}
      </div>
    </div>
  )
}

export function ProjectDetails({ project, onClose }) {
  const { projectname, projectid, location, status, client, startdate, enddate, project_manager_name } = project;
  const start = new Date(startdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const end = new Date(enddate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed top-0 left-0 z-[100] flex justify-center items-center h-screen w-screen bg-[rgba(0,0,0,0.3)]">
      <div className="z-[101] bg-white w-1/2 h-[50%] p-6 rounded shadow-lg flex flex-col items-end">
        <button onClick={onClose} className="text-sm text-gray-700 hover:text-black cursor-pointer">X</button>
        <div className="w-full h-full mt-2">
          <div className="flex justify-between items-center gap-x-[10px] h-fit w-full m-0 mb-5 p-0 border-b border-[rgba(0,0,0,0.6)]">
            <h1 className="text-[22px] font-medium p-0 pb-[5px] m-0">{projectname}: {location}</h1>
            {/* <Status status={status}/> */}
          </div>
          <div className="flex flex-col gap-y-[16px]">
            <p className="font-light text-[17px]"><span className="font-medium">Client:</span> {client}</p>
            <p className="font-light text-[17px]"><span className="font-medium">Project Manager:</span> {project_manager_name}</p>
            <p className="font-light text-[17px]"><span className="font-medium">Project Location:</span> {location}</p>
            <p className="font-light text-[17px]"><span className="font-medium">Start Date:</span> {new Date(startdate).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}</p>
            <p className="font-light text-[17px]"><span className="font-medium">End Date:</span> {new Date(enddate).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateProject({ text, svg, onClick }) {
  return (
    <button onClick={onClick} className="flex justify-center items-center gap-x-[8px] w-[15%] m-0 p-[.3em] rounded-sm border 
    border-[#D0D5DA] bg-white self-end cursor-pointer hover:shadow-[0_2px_2px_rgb(12_45_73_/_0.2)] transition-all">
      {svg} {text}
    </button>
  )
}

export function CreateProjModal({ onClose }) {

  const [formData, setFormData] = useState({
    projectName: '',
    location: '',
    status: 'Ongoing',
    client: '',
    pmid: '',
    startdate: '',
    enddate: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.projectName.trim()) {
      e.preventDefault();
      return;
    }

    try {

      const data = await addProject(formData);

    } catch (err) {

    }
  }

  return (
    <div className="fixed top-0 left-0 z-[100] flex justify-center items-center h-screen w-screen bg-[rgba(0,0,0,0.3)]">
      <div className="z-[101] bg-white w-[40%] h-[65%] p-6 rounded shadow-lg flex flex-col">
        <button onClick={onClose} className="text-sm text-gray-700 hover:text-black cursor-pointer self-end">X</button>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-y-[15px] mt-4 m-0">

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
            label="Client"
            name="client"
            placeholder="Enter Client Name"
            value={formData.client}
            onChange={handleChange}
          />

          {/* <select name="pmid" value={formData.pmid} onChange={handleChange}>
            <option value="">Select Project Manager</option>
            {managers.map((pm) => (
              <option key={pm.pmid} value={pm.pmid}>
                {pm.fname} {pm.lname}
              </option>
            ))}
          </select> */}

          <InputField
            label="Start Date"
            name="startdate"
            placeholder="Enter Start Date"
            value={formData.startdate}
            onChange={handleChange}
          />
          <InputField
            label="End Date"
            name="enddate"
            placeholder="Enter End Date"
            value={formData.enddate}
            onChange={handleChange}
          />

          <SubmitButton text="Create Project" />
        </form>

      </div>
    </div>
  )
}