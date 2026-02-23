import React, { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 300);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className={'fixed inset-0 bg-black bg-opacity-50 opacity-100 flex justify-center items-center z-50' }
    >
      <div
        className={`bg-white p-6 flex items-center justify-center rounded shadow-lg
          max-w-sm w-full relative h-40 ease-[cubic-bezier(0.25,2.0,0.5,1)] duration-500
          transition-transform  
          ${show ? "translate-y-[10px] opacity-100" : "translate-y-20 opacity-0"} `}
      >
        <div className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold"> X </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
