import axios from 'axios'
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import PostCard from '../../components/PostCard';
import SideBar from '../../components/SideBar';
import { useAuthState } from '../../context/auth';
import { Post } from '../../types';
import { Sub } from '../../types';
import { RiPencilLine } from 'react-icons/ri';
import useSWRInfinite from 'swr/infinite'
import Loading from '../../components/loading';


const SubPage = () => {
    const [ownSub, setOwnSub] = useState(false);
    const { authenticated, user } = useAuthState();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const subName = router.query.sub;

    const [isDelayLoading, setIsDelayLoading] = useState(false)
    const [observedPost, setObservedPost] = useState('')


    const fetcher = (url: string) =>
    axios.get(url).then(res => res.data)

    // 무한 스크롤 posts
    const getKey = (pageIndex: number, previousPageData: Sub | null) => {
    if (previousPageData && !previousPageData.posts.length) return null
    return `/subs/${subName}?page=${pageIndex}`
    }

    const {
        data,
        error,
        size,
        setSize,
        mutate
    } = useSWRInfinite<Sub>(getKey, fetcher)

    const subData = data?.[0] 

    useEffect(() => {
    setSize(1)  
    }, [subName])

    console.log('subdata', subData)

    const posts = data
    ? data.flatMap(page => page.posts)
    : []
    

    console.log("posts", posts);

    useEffect(() => {
        if (!posts.length) return
        const id = posts[posts.length - 1].identifier
        if (id !== observedPost) {
        setObservedPost(id)
        observeElement(document.getElementById(id))
        }
    }, [posts])

  const observeElement = (element: HTMLElement | null) => {
    if (!element) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          observer.unobserve(element)
          setIsDelayLoading(true)
          setTimeout(() => {
            setSize(prev => prev + 1)
            setIsDelayLoading(false)
          }, 1000)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(element)
  }


    

    useEffect(() => {
        if (!subData || !user) return;
        setOwnSub(authenticated && user.username === posts[0]?.username);
    }, [subData])

    const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files === null) return;
        
        const file = event.target.files[0];
        console.log('file', file);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", fileInputRef.current!.name);

        try {
            await axios.post(`/subs/${subName}/upload`, formData, {
                headers: { "Context-Type": "multipart/form-data" }
            });
            if (mutate) mutate();
        } catch (error) {
            console.log(error);
        }
    }

    const openFileInput = (type: string) => {
        if (!ownSub) return;

        const fileInput = fileInputRef.current;
        if (fileInput) {
            fileInput.name = type;
            fileInput.click();
        }
    }

    let renderPosts;
    if (!posts) {
        renderPosts = <div className="flex justify-center py-6"><Loading /></div>
    } else if (posts.length === 0) {
        renderPosts = <p className="text-lg text-center">아직 작성된 포스트가 없습니다.</p>
    } else {
        renderPosts = posts.map((post: Post) => (
            <PostCard key={post.identifier} post={post} subMutate={mutate} />
            
        ))
    }
    console.log('sub.imageUrl', subData?.imageUrl)
    return (
        <>
            {subData &&
                    <div className='mt-18'>
                        <input type="file" hidden={true} ref={fileInputRef} onChange={uploadImage} />
                        {/* 배너 이미지 */}
                        <div className="bg-gray-400 ">
                            {subData.bannerUrl ? (
                                <div
                                    className='h-56'
                                    style={{
                                        backgroundImage: `url(${subData.bannerUrl})`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                    onClick={() => openFileInput("banner")}
                                >
                                </div>
                            ) : (
                                <div className='h-40 bg-gray-400 '
                                    onClick={() => openFileInput("banner")}
                                ></div>
                            )}
                        </div>
                        {/* 커뮤니티 메타 데이터 */}
                        <div className='h-20 bg-white'>
                            <div className='relative flex max-w-6xl px-5 mx-auto'>
                                <div className='absolute' style={{ top: -50 }}>
                                    {subData.imageUrl && (
                                        <div className='  '>
                                        <img
                                            src={subData.imageUrl}
                                            alt="커뮤니티 이미지"
                                            className="w-[100px] h-[100px] rounded-full object-cover cursor-pointer bg-white border-4 border-white"
                                            onClick={() => openFileInput("image")}
                                        />
                                        </div>
                                    )}
                                </div>
                                <div className='relative pt-2 ml-28'>
                                    <div className='flex items-center'>
                                        <h1 className='text-3xl font-bold '>{subData.title}</h1>
                                    </div>
                                    <p className='font-bold text-gray-400 text-small'>
                                        /s/{subData.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* 포스트와 사이드바 */}
                        <div className='max-md:flex-col flex max-w-5xl px-4 pt-5 mx-auto'>
                            <div className="w-full md:mr-4 md:w-8/12">
                                {renderPosts}
                                {isDelayLoading && (
                                <div className="flex justify-center py-6">
                                    <Loading />
                                </div>
                                )}
                            </div>
                            <div className='w-4/12 mx-auto '>
                            <SideBar subData={subData} />
                            {authenticated && (
                                    <Link
                                        href={`/s/${subData.name}/create`}
                                        className="max-md:fixed max-md:right-4 max-md:w-[160px] max-md:bottom-4 mt-4 w-[90%] mx-auto  font-semibold flex  text-md p-4 bg-blue-500 text-white  rounded-full text-center hover:bg-blue-400"
                                    >
                                        <div className='mx-auto flex'>
                                            <RiPencilLine  className='w-5 h-5 mt-[2px] mr-3'/>
                                            <p>게시물 작성</p>
                                        </div>
                                    </Link>
                            )}
                            </div>
                        </div>
                    </div>
            }
        </>
    )
}

export default SubPage