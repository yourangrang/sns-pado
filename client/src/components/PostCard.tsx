import axios from 'axios'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthState } from '../context/auth'
import { Post } from '../types'
import { LuBookmark } from 'react-icons/lu'
import PostImages from './PostImages'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'
import { IoClose } from "react-icons/io5";
import { useEffect, useRef, useState } from 'react'

dayjs.extend(relativeTime)
dayjs.locale('ko')


interface PostCardProps {
    post: Post
    subMutate?: () => void
    mutate?: () => void
    mutateSaved?: () => void
    usermutate?: () => void
}

type PublicUser = {
  username: string;
  imageUrl: string;
};

type RecentComment = {
  id: number;
  body: string;
  createdAt: string;
  userInfo: PublicUser;
};


const PostCard = ({
    post: {
        identifier,
        slug,
        body,
        title,
        subName,
        createdAt,
        commentCount,
        url,
        username,
        sub,
        userImageUrl,
        saved,
        images,
        imageUrls,
        recentComments,
        liked,
        likeScore
    },
    mutate,
    subMutate,
    mutateSaved,
    usermutate
}: PostCardProps) => {
    const router = useRouter();
    const { authenticated } = useAuthState();
    const { user } = useAuthState(); 
    const subUrl = router.query.sub === subName 
    const contentRef = useRef<HTMLParagraphElement>(null);

    const [expanded, setExpanded] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        if (contentRef.current) {
        const lineHeight = parseFloat(
            getComputedStyle(contentRef.current).lineHeight
        );
        const maxHeight = lineHeight * 7; // 7줄 기준
        if (contentRef.current.scrollHeight > maxHeight) {
            setShowButton(true);
        }
        }
    }, [body]);

    const savePost = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (!authenticated) return router.push("/login");

        try {
            await axios.post(`/posts/${identifier}/${slug}/save`);
            if (mutate) mutate(); 
            if (mutateSaved) mutateSaved(); 
            if (usermutate) usermutate();
            if (subMutate) subMutate();

        } catch (e) {
            if (mutate) mutate();
            if (mutateSaved) mutateSaved(); 
            if (usermutate) usermutate();
            if (subMutate) subMutate();

        }
    };


    // const vote = async (value: number) => {
    //     if (!authenticated) router.push("/login");

    //     if (value === userVote) value = 0;

    //     try {
    //         await axios.post("/votes", { identifier, slug, value });
    //         if (mutate) mutate();
    //         if (subMutate) subMutate();
    //         if (usermutate) usermutate();
    //         if (mutateSaved) mutateSaved(); 
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    const deletePost = async () => {
        if (!authenticated) return router.push("/login");

        if (!confirm("정말 이 게시물을 삭제할까요?")) return;

        try {
            await axios.delete(`/posts/${identifier}`);

            // 리스트 갱신
            if (mutate) mutate();
            if (subMutate) subMutate();
            if (usermutate) usermutate();

            } catch (e) {
                alert("게시물 삭제 실패");
            }
    };


    const likePost = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!authenticated) return router.push("/login");

        try {
            await axios.post("/likes", { identifier, slug });
            if (mutate) mutate();
            if (subMutate) subMutate();
            if (usermutate) usermutate();
            if (mutateSaved) mutateSaved(); 
        } catch (e) {
            mutate && mutate();
        }
    };
            

    return (
    <div>
        <Link href={url}>
            <div className="
                relative
                w-full mb-4
                p-4
                rounded-3xl
                bg-white
                shadow-lg
            ">
            
                <div
                    className='flex '
                    id={identifier}
                >

                    {/* 작성자 이미지 */}
                    <div className="flex-col w-[53px]   text-center item-center flex">
                        <Link href={`/u/${username}`}
                        >
                            <img
                                src={userImageUrl}
                                alt="sub"
                                className="w-[48px] h-[48px] bg-gray-300 object-cover  border-4 border-gray-300 rounded-full cursor-pointer "
                                />
                        </Link>
                        {recentComments?.length > 0 ?
                        (
                            <div className='w-1  bg-gray-200 mx-auto my-1 h-full  rounded-md'></div>
                        ):(
                            ""
                        )}
                        
                    </div>

                    {/* 삭제 버튼 */}
                    {authenticated && user?.username === username && (
                        <button
                            onClick={(e) => {
                            e.preventDefault(); 
                            deletePost();
                            }}
                            className="text-sm absolute right-2 mt-[-6px] text-gray-500 p-1 rounded-full hover:bg-blue-100 transition-colors ease-in "
                        >
                            <IoClose className='w-5 h-5 '/>
                        </button>
                    )}
                    

                    {/* 포스트 데이터 */}
                    <div className="w-full  ml-4">
                            <div className='flex justify-between '>
                                <div className='flex-wrap'>
                                        <Link
                                            href={`/u/${username}`}
                                            className=" mr-1 text-sm font-bold cursor-pointer hover:underline"
                                        >
                                            @{username}
                                        </Link>
                                        <Link
                                            href={url}
                                            className='mx-1 hover:underline text-xs text-gray-400'
                                            >
                                            {dayjs(createdAt).fromNow()}

                                        </Link>
                                    <Link
                                        href={`/s/${subName}`}
                                    >
                                        {!subUrl && (
                                            <div className='w-fit  mt-[2px] flex py-[1px] px-1 text-xs font-bold text-gray-400 border-2 border-gray-300  rounded-xl  hover:border-blue-400 hover:text-white hover:bg-blue-400'>
                                                #{subName}
                                            </div>
                                        )}
                                    </Link>
                                </div>
                            </div>
                        <h2 className='text-lg font-semibold my-1'>{title}</h2>
                        {/* {body && 
                            <p className="my-2 text-md whitespace-pre-wrap break-words" 
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 7,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                            {body}
                            </p>
                        } */}
                        
                        <p
                            ref={contentRef}
                            className="my-2 text-md whitespace-pre-wrap break-words"
                            style={
                                expanded
                                ? {}
                                : {
                                    display: "-webkit-box",
                                    WebkitLineClamp: 7,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    }
                            }
                        >
                            {body}
                        </p>

                        {showButton && (
                        <button
                            onClick={(e) => {
                            e.preventDefault();   // Link 기본 이동 막기
                            e.stopPropagation(); // 부모 Link 클릭 막기
                            setExpanded(!expanded);
                            }}
                            className="text-blue-500 text-sm font-medium"
                        >
                            {expanded ? "접기" : "더보기"}
                        </button>
                        )}

                        {/* 게시물이미지 */}
                        {imageUrls && imageUrls.length > 0 && (
                            <div className="mt-[-4px] mb-2">
                                <PostImages imageUrls={imageUrls} />
                            </div>
                        )}

                        {/* 아이콘 */}
                        <div className="flex font-semibold text-md ">
                            <div className="flex items-center ">
                                <button
                                    onClick={likePost}
                                    className={` ${
                                    liked ? "fill-red-600" : "fill-gray-400" }`}
                                >
                                    {liked ? 
                                    <svg width={28} viewBox="0 0 24 24" aria-hidden="true">
                                        <g>
                                        <path
                                            d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                                        </g>
                                    </svg>
                                    :
                                    <svg width={28} viewBox="0 0 24 24" aria-hidden="true">
                                        <g>
                                        <path
                                            d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                                        </g>
                                    </svg>
                                    }
                                </button>
                                <span className="ml-[2px] ">
                                    {likeScore}
                                </span>
                            </div>
                            
                            <Link href={url} className="flex items-center mx-4 fill-gray-400">
                                <svg width={26} viewBox="0 0 24 24" aria-hidden="true">
                                    <g>
                                    <path
                                        d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
                                    </g>
                                </svg>
                                <span className='ml-[2px]'>{commentCount}</span>
                            </Link>
                            <button
                                onClick={savePost}
                                className={` ${
                                    saved ? "text-blue-500" : ""
                                }`}
                            >
                                {saved ? <LuBookmark className='w-[24px] h-[24px] fill-blue-500 '/> : <LuBookmark className='w-[24px] h-[24px] text-gray-400' />}
                            </button>
                            {recentComments && recentComments.length > 0 &&  <span className='w-full py-6' /> }
                        </div>
                    </div>
                    {/*  최신 댓글 3개 */}
                </div>
                {recentComments && recentComments.length > 0 && (
                    <div className='w-full h-auto '>
                        <div>
                            {recentComments.map((c, i) => (
                                <div key={c.identifier} className="flex-wrap text-sm  ">
                                    <div className='flex justify-between  '>
                                        <div className='w-[50px] '>
                                            <img 
                                                src={c.userInfo.imageUrl}
                                                alt={c.userInfo.username}
                                                className='mx-auto w-7 h-7 border-[3.5px] bg-gray-300 border-gray-300 rounded-full' 
                                            />
                                        </div>
                                        <div className='w-full mt-[4px] ml-3 line-clamp-1'>{c.body}</div>
                                    </div>
                                    <div className='w-[45.6px]'>
                                        {i !== recentComments.length - 1 && (
                                            <div className=' w-1  my-1 mx-auto bg-gray-200  rounded-md h-2'></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Link>
    </div>
    )
}

export default PostCard
