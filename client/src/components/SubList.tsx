import useSWR from 'swr';
import { Sub } from '../types';
import Link from 'next/link';


export default function SubList() {

  const address = `/subs/topSubs`;
  const { data: topSubs } = useSWR<Sub[]>(address);
  
  console.log('topSubs', topSubs);


  return (
      <div className='mb-4  rounded-xl p-2  border-blue-200 flex-wrap justify-center shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_2px_2px_2px_rgba(255,255,255,0.9)]  hover:shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_2px_2px_2px_rgba(255,255,255,0.9)]  bg-gradient-to-br from-blue-500/20 to-blue-200/10  transition-all duration-[600ms] ease-in-out  '>
        <Link href="/s/subList"> 
          <div className='px-4 pb-3 py-1'>
            <p className='text-md font-semibold text-center'>지금 인기 커뮤니티 보러가기</p>
          </div>
        </Link>

        {/* 커뮤니티 리스트 */}
        <div>
          {topSubs?.map((sub) => (
            <Link href={`/s/${sub.name}`}
              key={sub.name}
              className="flex items-center mx-1 hover:mx-0 px-3 py-2 text-xs bg-white  shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.9)]  hover:shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_1px_2px_1px_rgba(255,255,255,0.9)]  bg-gradient-to-br  from-blue-200/50   rounded-2xl mb-1 transform transition-all ease-in  "
            >
              <div
                    className='w-[36px] h-[36px] rounded-full  cursor-pointer bg-gray-200 flex justify-center items-center  '>
                <img
                  src={sub.imageUrl}
                  className="w-[30px] h-[30px] rounded-full object-cover "
                  alt="Sub"
                />
              </div>
              <div
                className='ml-2 font-bold hover:cursor-pointer'
              >
                {sub.name}
              </div>
              <div className='ml-auto py-1 px-2 bg-blue-500 text-[10px] rounded-full font-bold text-white'>{sub.postCount}</div>
            </Link>
          ))}
        </div>
          
    </div>
  )
}
