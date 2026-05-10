import React, { useState } from "react";
import axios from "axios";
import Modal from "./ModalProps";
import { LuPartyPopper } from "react-icons/lu";
import { useRouter } from "next/router";
import { MdKeyboardArrowRight } from "react-icons/md";

type props = {
  activeClass: (path: string) => string;
}

const QuoteBox = ({ activeClass }:props) => {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  

  const fetchQuote = async () => {
    try {
      router.push('/')
      const res = await axios.get("/quotes/today");
      setQuote(res.data.quote);
      setIsOpen(true);
      console.log('quote',res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => setIsOpen(false);

  return (
    <div >
      <button
        className={`flex py-4 px-4 w-full items-center font-bold rounded-xl
            ${isOpen ? activeClass('modal') : 'hover:bg-blue-300 hover:bg-opacity-10 hover:text-blue-600 hover:translate-x-1 transition-all ease'}`}
        onClick={fetchQuote}
      >
        <LuPartyPopper  className="w-6 h-6 max-md:w-[20px] max-md:h-[20px] "/>
        <p className="ml-6 font-bold max-lg:hidden  max-md:block max-md:ml-4 ">명언이 왔어요!</p>
        {isOpen && <MdKeyboardArrowRight  className='w-5 h-5 ml-auto '/>}
      </button>

      <Modal isOpen={isOpen} onClose={closeModal} >
          {quote &&
            <p className="text-lg font-medium text-center text-black ">
              {quote.text} <br />
              <span className="text-sm italic font-normal">- {quote.author}</span>
            </p>
          }
      </Modal>
    </div>
  );
};

export default QuoteBox;
