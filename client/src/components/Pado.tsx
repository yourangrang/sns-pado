import React, { useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import { GiBigWave } from "react-icons/gi";
import PostCard from "./PostCard";
import { Post } from "../types";
import { useRouter } from "next/router";
import { MdKeyboardArrowRight } from "react-icons/md";

type props = {
  activeClass: (path: string) => string;
}

const Pado = ({activeClass}:props) => {
  const [post, setPost] = useState<Post>();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const fetch = async () => {
    try {
      router.push('/');
      const res = await axios.get("/posts/random");
      setPost(res.data);
      setIsOpen(true);
      console.log('post', res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => setIsOpen(false);

  return (
    <div>
      <button
        className={`flex py-4 px-3 w-full items-center font-bold rounded-xl
           ${!isOpen  && 'hover:bg-blue-300 hover:bg-opacity-10 hover:text-blue-600 hover:translate-x-1 transition-all ease'}
          ${isOpen ? activeClass('modal') : ''}`}
        onClick={fetch}
      >
        <GiBigWave  className="w-6 h-6 max-md:w-[20px] max-md:h-[20px]"/>
        <p className="ml-6 font-bold max-lg:hidden  max-md:block max-md:ml-4 ">파도치기</p>
         {isOpen && <MdKeyboardArrowRight  className='w-5 h-5 ml-auto '/>}
      </button>

      <Modal isOpen={isOpen} onClose={closeModal} onWave={fetch}>
        {post && <PostCard key={post.identifier} post={post} />}
      </Modal>
    </div>
  );
};

export default Pado;
