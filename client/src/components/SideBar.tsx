import { Sub } from '../types'
import dayjs from 'dayjs';

type Props = {
    subData: Sub
}

const SideBar = ({ subData }: Props) => {
    return (
            <div className='max-md:hidden w-full bg-white border rounded-xl p-4'>
                    <p className='font-semibold '>커뮤니티 정보</p>
                <div className='pt-2 px-3 '>
                    <p className='mb-3 text-sm font-light'>{subData?.description}</p>
                    <div className='flex mb-3 text-sm font-medium'>
                        <div className='w-1/2 flex'>
                            <p>게시글</p>
                            <p className='ml-2 font-light'>{subData.postCount}</p>
                        </div>
                    </div>
                    <div className='flex mb-3 text-sm font-medium'>
                        <div className='w-1/2 flex'>
                        <p>생성일</p>
                        <p className="ml-2 font-light">
                            {dayjs(subData?.createdAt).format('MM.DD.YYYY')}
                        </p>
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default SideBar
