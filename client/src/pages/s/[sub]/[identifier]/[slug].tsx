import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router"
import useSWR from 'swr';
import { Comment, Post } from "../../../../types";
import dayjs from 'dayjs';
import { useAuthState } from "../../../../context/auth";
import { FormEvent, useState } from "react";
import { LuBookmark } from "react-icons/lu";
import PostImages from "../../../../components/PostImages";

const PostPage = () => {
    const router = useRouter();
    const { identifier, sub, slug } = router.query;
    const { authenticated, user } = useAuthState();
    const [newComment, setNewComment] = useState("");
    const { data: post, error, mutate: postMutate } = useSWR<Post>(identifier && slug ? `/posts/${identifier}/${slug}` : null);
    const { data: comments, mutate: commentMutate } = useSWR<Comment[]>(
        identifier && slug ? `/posts/${identifier}/${slug}/comments` : null
    )

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (newComment.trim() === "") return;

        try {
            await axios.post(`/posts/${post?.identifier}/${post?.slug}/comments`, {
                body: newComment
            });
            commentMutate();
            postMutate();
            setNewComment("");
        } catch (error) {
            console.log(error);
        }
    }


     const savePost = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (!authenticated) return router.push("/login");

        try {
            await axios.post(`/posts/${identifier}/${slug}/save`);
            if (postMutate) postMutate();
            if (commentMutate) commentMutate(); 
        } catch (e) {
            if (postMutate) postMutate();
            if (commentMutate) commentMutate(); 

        }
    };

    
    const likePost = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!authenticated) return router.push("/login");

        try {
            await axios.post("/likes", { identifier, slug });
            if (postMutate) postMutate();
            if (commentMutate) commentMutate(); 
        } catch (e) {
            if (postMutate) postMutate();
            if (commentMutate) commentMutate(); 
        }
    };
         

    return (
        <div className=" min-h-screen ">
                <div className="max-md:w-5/6 mt-20 mb-20  mx-auto w-4/6 bg-white rounded-3xl p-4">
                    {post && (
                        <>
                            <div className="flex">
                                {/* 작성자 이미지 */}
                                <div className="flex-col w-[53px]  text-center item-center flex">
                                    <Link href={`/u/${post.username}`}
                                    >
                                        <img
                                            src={post.userImageUrl}
                                            alt="sub"
                                            className="w-[48px] h-[48px]  bg-gray-300 object-cover  border-4 border-gray-300 rounded-full cursor-pointer "
                                            />
                                    </Link>
                                    
                                </div>
                
                                {/* 포스트 데이터 */}
                                <div className="w-full mt-1 ml-4">
                                        <div className='flex justify-between '>
                                            <div className='flex-wrap'>
                                                <div className='flex mb-1 '>
                                                    <Link
                                                        href={`/u/${post.username}`}
                                                        className=" mr-1 text-sm font-bold cursor-pointer hover:underline"
                                                    >
                                                        @{post.username}
                                                    </Link>
                                                    <p className="text-xs text-gray-400">
                                                        <Link
                                                            href={post.url}
                                                            className='mx-1 hover:underline'
                                                            >
                                                            {/* {dayjs(createdAt).format('YYYY-MM-DD HH:mm')} */}
                                                            {dayjs(post.createdAt).fromNow()}
                
                                                        </Link>
                                                    </p>
                                                </div>
                                                <Link
                                                    href={`/s/${post.subName}`}
                                                >
                                                    <div className='w-fit flex  px-1 text-xs font-bold text-gray-400 border-2 border-gray-300  rounded-xl  hover:border-blue-400 hover:text-white hover:bg-blue-400'>
                                                        #{post.subName}
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                            
                                    <h2 className='text-lg font-semibold my-1'>{post.title}</h2>
                                    {post.body && <p className="mt-2 mb-1 text-md whitespace-pre-wrap break-words">{post.body}</p>}
                                    
                                    {post.imageUrls && post.imageUrls.length > 0 && (
                                        <div className=" ">
                                            <PostImages imageUrls={post.imageUrls} />
                                        </div>
                                    )}
                
                                    {/* 아이콘 */}
                                    <div className="flex font-semibold text-md mt-3 ">
                                        <div className="flex items-center ">
                                            <button
                                                onClick={likePost}
                                                className={` ${
                                                post.liked ? "fill-red-600" : "fill-gray-400" }`}
                                            >
                                                {post.liked ? 
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
                                                {post.likeScore}
                                            </span>
                                        </div>
                                        <Link href={post.url} className="flex items-center mx-4 fill-gray-400">
                                            <svg width={26} viewBox="0 0 24 24" aria-hidden="true">
                                                <g>
                                                <path
                                                    d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
                                                </g>
                                            </svg>
                                            <span className='ml-[2px]'>{post.commentCount}</span>
                                        </Link>
                                        <button
                                            onClick={savePost}
                                            className={` ${
                                                post.saved ? "text-blue-500" : ""
                                            }`}
                                        >
                                            {post.saved ? <LuBookmark className='w-[24px] h-[24px] fill-blue-500 '/> : <LuBookmark className='w-[24px] h-[24px] text-gray-400' />}
                                        </button>
                                    </div>

                                    {/* 댓글 작성 */}
                                    <div className=" mt-6 ">
                                        {authenticated ? (
                                            <div className=""> 
                                                <form onSubmit={handleSubmit} className="group flex-1 ">
                                                    <textarea
                                                        className="w-full p-3 h-28   border-2 border-gray-300 rounded-xl focus:outline-none   "
                                                        onChange={e => setNewComment(e.target.value)}
                                                        value={newComment}
                                                        placeholder="의견을 남겨보세요"
                                                        required
                                                    />
                                                    <div className="flex justify-end">
                                                        <button
                                                            className="px-3 py-1 text-white bg-gray-300 group-valid:bg-blue-500 rounded-lg cursor-pointer"
                                                            disabled={newComment.trim() === ""}
                                                        >
                                                            댓글 등록
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        ) : (
                                                <Link href={`/login`} >
                                                    <form onSubmit={handleSubmit} className="group flex-1 ">
                                                    <textarea
                                                        className="w-full p-3 h-28   border-2 border-gray-300 rounded-xl focus:outline-none   "
                                                        onChange={e => setNewComment(e.target.value)}
                                                        value={newComment}
                                                        placeholder=" 댓글 작성을 위해서 로그인 해주세요."
                                                        required
                                                    />
                                                    <div className="flex justify-end">
                                                        <button
                                                            className="px-3 py-1 text-white bg-gray-300 group-valid:bg-blue-500 rounded-lg cursor-pointer"
                                                            disabled={newComment.trim() === ""}
                                                        >
                                                           댓글 등록
                                                        </button>
                                                    </div>
                                                </form>
                                                </Link>
                                        )}
                                    </div>

                                </div>
                            </div>

                            {/* 댓글 리스트 */}
                            {comments && comments.length > 0 && (
                                <div className=' mx-auto  '>
                                    <div className="">
                                    {comments.map((c, i) => (
                                        <div key={c.identifier} className="flex-col text-sm bg-gray-100 rounded-xl p-3 my-2">
                                            <div className='flex justify-between '>
                                                <div className='w-[46px]'>
                                                    <img 
                                                        src={c.userInfo.imageUrl}
                                                        alt={c.userInfo.username}
                                                        className=' w-8 h-8 border-[3.5px] border-gray-300 rounded-full  bg-gray-300 ' 
                                                    />
                                                </div>
                                                <div className="w-full flex-col text-md  ">
                                                    <Link
                                                        href={`/u/${c.username}`}
                                                        className=" mr-1 font-bold cursor-pointer hover:underline"
                                                        >
                                                    @{c.username}
                                                    </Link>
                                                    <span className='mx-1 hover:underline  text-gray-400'>
                                                        {dayjs(c.createdAt).fromNow()}
                                                    </span>    
                                                    <p className="mt-1 ">{c.body}</p>
                                                </div>
                                            </div>
                                            <div className=''>
                                            {i !== comments.length - 1 && (
                                                <div className=' w-full h-[1px]  mx-auto '></div>
                                            )}
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
    )
}

export default PostPage;
