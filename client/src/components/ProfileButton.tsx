import { useAuthState } from '../context/auth';
import { CgProfile } from "react-icons/cg";
import { useRouter } from 'next/router';
import useSWR from 'swr';

export default function ProfileButton() {
  const { authenticated, user, loading} = useAuthState();
  const router = useRouter();

  if (loading ) return null;
  console.log("profileuser", user);
  
  const handleClick = () => {
    if (authenticated) {
      router.push(`/u/${user?.username}`);
    } else {
      router.push('/login');
    }

  };
 
  const { data, error } = useSWR(`/users/count`);
  console.log("count", data);
  
  return (
    <>
    <button className=" mb-4 flex-wrap justify-center bg-gradient-to-br from-blue-500/100 to-blue-500/50  transition-all duration-[400ms] ease-in-out shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_2px_2px_2px_rgba(255,255,255,0.9)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_2px_2px_2px_rgba(255,255,255,0.9)] item-center py-3 rounded-xl w-full"  onClick={handleClick}>
            {authenticated && user?.imageUrl  ? (
              <div className='w-[74px] h-[74px]  bg-white rounded-full m-auto flex justify-center items-center'>
                <img
                    src={user?.imageUrl}
                    alt="유저 이미지"
                    className='w-[64px] h-[64px]  boder-2 object-cover border-gray-600 rounded-full'
                />
              </div>
              ) : ( 
                <CgProfile className="w-[54px] h-[54px] text-white rounded-full  m-auto object-cover" />
              )}
                <div className='text-lg  font-medium my-1 font-10 text-white  '>
                  {authenticated ? ` ${user?.username} ` : '내 프로필'}  
                </div>
                <div className='flex justify-center items-center'>
                  <div className='flex-wrap py-1 px-2 text-sm font-bold  bg-gray-100 text-white bg-opacity-40  rounded-xl text-center ml-1 mr-2'>
                    <span>{data?.postCount || 0}</span>
                    <p className='text-xs font-light'>게시글</p> 
                  </div>
                  <div className='flex-wrap py-1 px-2 text-sm font-bold  bg-gray-100 text-white bg-opacity-40  rounded-xl text-center'>
                    <span>{data?.commentCount || 0}</span>
                    <p className='text-xs font-light'>댓글</p> 
                  </div>
                </div>
      </button>
    </>
  )
}
