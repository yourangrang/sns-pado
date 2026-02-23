import Link from "next/link"
import SearchForm from './SearchForm';
import { IoMenu } from "react-icons/io5";
import { useRouter } from "next/router";
import { useAuthDispatch, useAuthState } from "../context/auth";
import axios from "axios";


interface NavBarProps {
  onToggle: () => void
}
const NavBar: React.FC<NavBarProps> = ({ onToggle }) => {

    const router = useRouter();
    const { loading, authenticated } = useAuthState();


    const dispatch = useAuthDispatch();
    

    const handleClick = () => {
        if(!authenticated) {
            router.push(`/login`);
        }

        axios.post("/auth/logout")
            .then(() => {
                dispatch("LOGOUT");
                window.location.reload();
            })
            .catch((error) => {
                console.log(error);
            })
    }
    

    return (
        <div className="fixed shadow-sm max-w-6xl mx-auto px-4 inset-x-0 top-0 z-10 flex items-center  bg-white h-16">

                {/* 햄버거 버튼 (md 미만에서만 보이게) */}
                <button
                    onClick={onToggle}
                    className="md:hidden  hover:bg-blue-100 rounded-full p-1 mr-1 transition-all ease-in duration-200 " 
                >
                    <IoMenu className="w-7 h-7 text-gray-600"/>
                </button>

                <Link href="/"
                      className="max-md:block  hidden  "
                >
                    <img
                    src="/logo.png"
                    alt="logo"
                    className='w-[64px] h-[18px] mx-auto my-6 max-sm:w-14 max-sm:h-5  '
                    />
                </Link>    

                <div className="hidden md:block md:w-[246px] h-screen" />

                <div className="max-md:mx-auto max-md:w-3/6  w-4/6 mx-auto  px-4 h-11 md:w-2/6 max-lg:mr-40 flex item-center bg-blue-50 rounded-3xl  transition-all duration-100 border hover:bg-white ">
                        <SearchForm />
                </div>
                <div className="hidden md:block md:w-[302px] "> </div>

                    {!loading && 
                        authenticated ? (
                            <button
                                className="lg:hidden font-semibold w-auto md:w-24 p-2 text-white text-sm text-center bg-blue-400  hover:bg-blue-300 rounded-full "
                                onClick={handleClick}
                            >
                               로그아웃
                            </button>
                    ):(
                        <button
                                className="lg:hidden font-semibold w-auto md:w-24 p-2 text-white text-sm text-center bg-blue-400  hover:bg-blue-300 rounded-full "
                                onClick={handleClick}
                        >
                               로그인
                        </button>
                    )
                    }
           
        </div>
    )
}

export default NavBar;
