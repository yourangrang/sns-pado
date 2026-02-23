import React, { useEffect, useRef, useState } from "react";

  interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    onWave?: () => void;
  }

  const WAVE_BIG = `
  M-160 44
  c30 0 58-40 88-15
  s58 15 88 15
  58-15 88-15
  58 15 88 15
  v44h-352z
  `;

  const WAVE_NORMAL = `
  M-160 44
  c30 0 58-3 88-3
  s58 3 88 3
  58-3 88-3
  58 3 88 3
  v44h-352z
  `;


const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, onWave  }) => {
  const [show, setShow] = useState(false);
  const animateRef = useRef<SVGAnimateElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      requestAnimationFrame(() => {
        animateRef.current?.beginElement(); 
      });
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

 const triggerWave = async () => {
  await onWave?.(); 

  animateRef.current?.beginElement(); 

  // 모달 애니메이션 재실행
  setShow(false); 
  setTimeout(() => setShow(true), 200);
};


  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* 배경 */}
      <div className="absolute inset-0 bg-black bg-opacity-80" />

      {/* 파도 */}
      <svg
        className="pointer-events-none absolute z-30 bottom-0 w-full  h-full "
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
      >
        <defs>
          <path id="wave-path" d={WAVE_NORMAL}>
            <animate
              ref={animateRef}
              attributeName="d"
              dur="2.5s"
              begin="indefinite"
              values={`
                ${WAVE_BIG};
                ${WAVE_NORMAL};
                ${WAVE_NORMAL}
              `}
              keyTimes="0;0.4;1"
              fill="freeze"
            />
          </path>
        </defs>

        <use
          href="#wave-path"
          fill="#60A5FA"
          opacity='90%'
          x="50"
          y="3"
          style={{
            animation: "moveForever 1.6s linear infinite",
            animationDelay: "-2s",
            zIndex:"10"
          }}
        />
        <use
          href="#wave-path"
          fill="#3b82f6"
          x="50"
          y="4"
          style={{
            animation: "moveForever 2s linear infinite",
            animationDelay: "-2s",
            zIndex:"30"
          }}
        />
      </svg>

      
          <div
            className="flex items-end h-screen  "
            onClick={(e) => e.stopPropagation()}
          >
            <button
                onClick={triggerWave} 
                className="px-8 py-4 z-50 mb-6 bg-white font-extrabold text-xl rounded-full text-blue-500 "
            >
                다시 파도치기
            </button>
          </div>


      {/*  모달 */}
      <div
        className={`px-4 absolute mb-40  rounded-lg  max-w-xl w-full 
          transition-all duration-1000 ease-[cubic-bezier(0.25,2,0.5,1)]
          ${show ? "translate-y-0 opacity-100" : "translate-y-80 opacity-0"}`}
      >
        {children}
      </div>

    </div>
  );
};

export default Modal;
