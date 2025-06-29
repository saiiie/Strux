export function Box({ children, className }) {
  return (
    <>
    <div className={`flex flex-col h-screen w-1/2 m-0 p-[1em] justify-center items-center ${className}`}>
      {children}
    </div>
    </>
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