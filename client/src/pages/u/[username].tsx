import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import PostCard from '../../components/PostCard';
import { Comment, Post } from '../../types';
import axios from 'axios';
import { useAuthState } from '../../context/auth';

const UserPage = () => {
    const [ownUser, setOwnUser] = useState(false);
    const [viewType, setViewType] = useState<'post' | 'comment'>('post'); 

    const router = useRouter();
    const username = router.query.username;

    const { authenticated, user } = useAuthState();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, error, mutate: usermutate } = useSWR(
        username ? `/users/${username}` : null
    );
    console.log('user page data', data);

    useEffect(() => {
        if (!data || !user) return;
        setOwnUser(authenticated && user.username === data.user.username);
    }, [data, user, authenticated]);

    if (!data) return null;

    const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;

        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', fileInputRef.current!.name);

        try {
            await axios.post(
                `/users/${data.user.username}/upload`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            usermutate();
        } catch (error) {
            console.log(error);
        }
    };

    const openFileInput = (type: string) => {
        if (!ownUser) return;
        if (fileInputRef.current) {
            fileInputRef.current.name = type;
            fileInputRef.current.click();
        }
    };

    return (

            <div className="w-full flex mt-4 bg-gray-200 px-4 pt-12 max-md:mt-52 max-md:h-full">
                {/*  게시물 / 댓글 리스트  */}
                <div className="w-full md:mr-3 md:w-8/12  ">
                    {/* 버튼 */}
                    <div className="flex my-4 justify-between max-md:fixed max-md:top-[172px] max-md:w-full max-md:border-t-2 max-md:left-0 z-10 ">
                        <button
                            onClick={() => setViewType('post')}
                            className={`w-full bg-white px-4 py-4 max-md:rounded-none rounded-l-lg font-bold border-r-2 ${
                                viewType === 'post'
                                    ? ' text-blue-500 '
                                    : ' text-gray-600'
                            }`}
                        >
                            게시물 내역
                        </button>
                        <button
                            onClick={() => setViewType('comment')}
                            className={` w-full bg-white max-md:rounded-none px-4 rounded-r-lg   font-bold  ${
                                viewType === 'comment'
                                    ? ' text-blue-500'
                                    : ' text-gray-600'
                            }`}
                        >
                            댓글 내역
                        </button>
                    </div>

                    {/* 리스트 */}
                    {data.userData
                        .filter((item: any) =>
                            viewType === 'post'
                                ? item.type === 'Post'
                                : item.type === 'Comment'
                        )
                        .map((item: any) => {
                            if (item.type === 'Post') {
                                const post: Post = item;
                                return (
                                    <PostCard
                                        key={post.identifier}
                                        post={post}
                                        mutate={usermutate}
                                    />
                                );
                            }

                            const comment: Comment = item;
                            return (
                                <div
                                    key={comment.identifier}
                                    className="flex mb-4 bg-white rounded-2xl p-2"
                                >
                                    <div className="flex-shrink-0 w-16 bg-white rounded-l-2xl ">
                                        <svg width={22} viewBox="0 0 24 24" aria-hidden="true" className='fill-gray-400 h-full mx-auto' >
                                            <g>
                                            <path
                                                d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
                                            </g>
                                        </svg>
                                    </div>
                                    <div className="w-full p-2">
                                        <p className=" flex mb-2 text-xs text-gray-400">
                                            <Link
                                                href={`/u/${comment.post?.url}`}
                                                className="font-md hover:bg-gray-100 rounded-lg"
                                            >
                                                {comment.post?.username}님의 게시글에 댓글을 남겼습니다.
                                            </Link>
                                            <div className='flex'>

                                            </div>
                                            <Link
                                                href={`/u/${comment.post?.subName}`}
                                                className=" ml-1 bg-gray border-2 border-gray-200 px-[4px] rounded-full hover:border-blue-300 hover:bg-blue-300"
                                            >
                                                {comment.post?.subName}
                                            </Link>
                                            <span className='flex-1 flex justify-end mr-2 '>{dayjs(comment.createdAt).fromNow()}</span>
                                        </p>
                                        <p className="p-1 ">"{" "}{comment.body}{" "}"</p>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/*  유저 정보  */}
                <div className="max-md:flex  max-md:justify-between max-md:top-12 max-md:fixed max-md:w-full  max-md:left-0 w-4/12 mt-4 ">
                    <div className="max-md:w-1/3  max-md:rounded-none flex-wrap items-center p-3 bg-white rounded-t-2xl">
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={uploadImage}
                        />

                        {data.user.imageUrl ? (
                            <img
                                src={data.user.imageUrl}
                                alt="유저 이미지"
                                className="w-[100px] h-[100px] mx-auto bg-gray-200  rounded-full object-cover cursor-pointer"
                                onClick={() => openFileInput('image')}
                            />
                        ) : (
                            <div
                                className="w-[100px] h-[100px] mx-auto border rounded-full cursor-pointer"
                                onClick={() => openFileInput('image')}
                            />
                        )}

                        <p className="max-md:hidden text-md  text-center font-semibold">
                            {data.user.username}
                        </p>
                    </div>

                    <div className="max-md:w-2/3 max-md:flex-col max-md:text-left  max-md:rounded-none pb-2 bg-white  text-center text-sm text-gray-500 rounded-b-2xl">
                        <p className="max-md:block mb-2 max-md:text-left max-md:pt-10 text-md  text-center font-semibold">
                            {data.user.username}
                        </p>
                        <p>
                            {dayjs(data.user.createdAt).format('YYYY.MM.DD')} 가입
                        </p>
                    </div>
                </div>
            </div>
    );
};

export default UserPage;
