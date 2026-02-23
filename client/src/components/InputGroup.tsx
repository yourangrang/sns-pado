import React from 'react'
import cls from "classnames";

interface InputGroupProps {
    className?: string;
    type?: string;
    placeholder?: string;
    value: string;
    error: string | undefined;
    setValue: (str: string) => void;
    required?: boolean;
}

const InputGroup: React.FC<InputGroupProps> = ({
    className = "mb-2",
    type = "text",
    placeholder = "",
    error,
    value,
    setValue,
    required
}) => {
    return (
        <div className={className}>
            <input
                type={type}
                required={required}
                style={{ minWidth: 300 }}
                 className={cls(
                    "w-full min-w-[300px] p-3 border-2 rounded-xl border-gray-300  bg-gray-100 focus:bg-white transition duration-200 outline-none",
                    { "border-red-500": error, "border-blue-300": !error , "bg-white": !error && value,}
                )}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <small className='font-medium text-red-500'>{error} </small>
        </div>
    )
}

export default InputGroup