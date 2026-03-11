import useSWR from 'swr';
import { Sub } from '../../types';
import Link from 'next/link';


export default function SubList() {

  const { data } = useSWR<Sub[]>(`/subs/allSubs`);
  
  console.log('allSubs', data);


  return (
      <div className='mb-4 mt-20 px-40 max-md:px-4 py-1 border-blue-200 flex-wrap justify-center h-screen '>
        <h2 className="pt-2 text-xl font-bold mb-4 max-md:text-md">커뮤니티 리스트입니다</h2>

        {/* 커뮤니티 리스트 */}
        <div>
          {data?.map((sub) => (
            <Link href={`/s/${sub.name}`}
              key={sub.name}
              className="flex items-center mx-1 my-2 hover:mx-0 px-3 py-3 text-xs bg-white  shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.9)]  hover:shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_1px_2px_1px_rgba(255,255,255,0.9)]  rounded-2xl mb-1 transform transition-all ease-in  "
            >
                <img
                  src={sub.imageUrl}
                  className="w-[40px] h-[40px] rounded-full object-cover "
                  alt="Sub"
                />
              <div
                className='ml-2 font-bold hover:cursor-pointer'
              >
                {sub.name}
              </div>
              <div className='flex text-center ml-auto  text-xs font-bold w-6 h-6  rounded-full bg-blue-500'><p className='m-auto text-white'>{sub.postCount}</p></div>
            </Link>
          ))}
        </div>
          
    </div>
  )
}
