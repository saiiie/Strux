import Image from "next/image";
import Link from "next/link";

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

export function Main({ columns, data }) {
  return (
    <div className="flex flex-col m-0 p-[1.3em] h-[100%] w-[100%] gap-y-[20px] items-center">
      <div className="flex flex-col m-0 p-[1.5em] gap-y-[20px] h-[90%] w-[100%] border border-[#0C2D4933] rounded-md bg-[#FFFFFF]">
        <p className="p-[1em] bg-[#E7F3FC]">Reserved Space for Search Filter (???)</p>
        <Table columns={columns} data={data} />
      </div>
      {/* <CreateProject /> */}
    </div>
  )
}

function Table({ columns, data }) {
  return (
    <div
      className="grid w-full border border-transparent rounded-md bg-white" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>

      {columns.map((col, index) => (
        <div key={`header-${index}`} className="p-[14px] text-[16px] text-[rgba(0,0,0,0.5)] bg-[#F9F9F9] text-center">
          {col.header}
        </div>
      ))}

      {data.map((row, rowIndex) =>
        columns.map((col, colIndex) => (
          <div key={`cell-${rowIndex}-${colIndex}`} className="m-0 p-[12px] pt-[16px] pb-[16px] text-[14px] text-center text-[rgba(0,0,0,0.8)]">
            {row[col.accessor]}
          </div>
        ))
      )}
    </div>
  );
}

// function CreateProject(){
//   return(
//     <button>Create Project</button>
//   )
// }