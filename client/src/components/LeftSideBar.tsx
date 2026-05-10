import Link from 'next/link'
import React from 'react'
import { FaHotjar, FaPlus } from 'react-icons/fa'
import QuoteBox from './QuoteBox'
import { LuBookmark } from 'react-icons/lu'
import { useRouter } from 'next/router'
import { useAuthDispatch, useAuthState } from '../context/auth'
import Pado from './Pado'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { MdOutbound } from "react-icons/md";
import axios from 'axios'
import { PiListMagnifyingGlassBold } from "react-icons/pi";

interface Props {
  closeSidebar: ()=>void;
}

export default function LeftSideBar({ closeSidebar }:Props) {
    const router = useRouter();
    const { loading, authenticated } = useAuthState();
    const currentpage  = router.pathname;
    const dispatch = useAuthDispatch();

    const handleLogout = () => {
        axios.post("/auth/logout")
            .then(() => {
                dispatch("LOGOUT");
                window.location.reload();
            })
            .catch((error) => {
                console.log(error);
            })
    }

    const isActive = (path: string) => {
      return currentpage === path || path === "modal";
    };

    const activeClass = (path: string) => {
      if (isActive(path)) {
        return 'rounded-xl ml-1 text-blue-600 shadow-[0_4px_20px_rgba(59,130,246,0.3),inset_2px_2px_2px_rgba(255,255,255,0.9)] bg-gradient-to-br from-blue-500/20 to-blue-500/10 opacity-1 transition-all duration-[400ms] ease-in-out flex items-center';
      } else {
        return 'text-black hover:bg-blue-300 hover:bg-opacity-10 hover:translate-x-1 hover:text-blue-600 transition-all ease flex items-center';
      }
    };

    const handleclick2 = (e: React.MouseEvent<HTMLButtonElement>) => {
      if(!authenticated){
        e.preventDefault();
        router.push('/login');
      }

      router.push('/subs/create');
  }
  return (
      <>
        <div className=" fixed md:w-[100px] lg:w-[246px] bg-white z-50 h-screen  px-4 border-r-[1px] border-gray-300 max-lg:w-[25%] shadow-lg max-md:w-52 ">
          <Link href="/" onClick={closeSidebar}>
            <img
              src="/logo.png"
              alt="logo"
              className='w-[100px] h-[28px] mx-auto my-6  '
            />
          </Link>
          <div className='flex flex-col gap-1 mt-10 max-lg:items-center max-md:items-start max-md:w-46 mx-auto max-md:text-sm'>
              <Pado activeClass={activeClass} />
            <Link href="/p"
                  onClick={closeSidebar}
                  className={` flex py-4 px-3 rounded-xl items-center font-bold mb-1 ${activeClass('/p')}`}
            >
              <FaHotjar className='w-6 h-6 max-md:w-[20px] max-md:h-[20px] '/>
              <span className='ml-7 max-lg:hidden  max-md:block max-md:ml-4 '>인기 게시물</span>
              {isActive('/p') && <MdKeyboardArrowRight  className='w-5 h-5 ml-auto'/>}
            </Link>
            <Link href="/saved"
                  onClick={closeSidebar}
                  className={`flex py-4 px-3  rounded-xl items-center font-bold mb-1 ${activeClass('/saved')}`}
            >
              <LuBookmark className='w-6 h-6  max-md:w-[20px] max-md:h-[20px]'/>
              <span className='ml-7 max-lg:hidden  max-md:block max-md:ml-4'>저장한 게시물</span>
               {isActive('/saved') && <MdKeyboardArrowRight  className='w-5 h-5 ml-auto'/>}
            </Link>
            <Link href="/s/subList"
                  onClick={closeSidebar}
                  className={`flex py-4 px-3  rounded-xl items-center font-bold mb-1 ${activeClass('/s/subList')}`}
            >
              <PiListMagnifyingGlassBold className='w-6 h-6  max-md:w-[20px] max-md:h-[20px]'/>
              <span className='ml-7 max-lg:hidden  max-md:block max-md:ml-4'>커뮤니티 리스트</span>
               {isActive('/s/subList') && <MdKeyboardArrowRight  className='w-5 h-5 ml-auto'/>}
            </Link>
            <QuoteBox activeClass={activeClass} />
            <div className='flex '>
              <button 
                onClick={handleclick2}
                className='mt-2 flex items-center justify-center max-lg:w-12 max-md:w-40  py-4 w-52 mx-auto hover:translate-x-1 text-white   bg-gradient-to-br  from-blue-500/100 to-blue-500/50  transition-all duration-[400ms] ease-in-out shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_2px_2px_2px_rgba(255,255,255,0.9)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_2px_2px_2px_rgba(255,255,255,0.9)]  rounded-xl '>
                    <FaPlus  className='w-4 h-4  '/>
                    <span className='text-center ml-4 max-lg:hidden max-md:block '>커뮤니티 만들기</span>
              </button>
            </div>

            
           <div className="flex ml-2 mt-40">
                {!loading && (
                    authenticated &&
                        <button
                            className=" flex items-center px-4 py-2  text-md text-center  hover:bg-blue-100 rounded-full "
                            onClick={handleLogout}
                        >
                            <MdOutbound className='w-5 h-5 mr-2' />Logout
                        </button>
                )}
            </div>
          </div>
        </div>
      </>
  )
}
