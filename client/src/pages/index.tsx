import type { NextPage, GetServerSideProps } from 'next'
import { SWRConfig } from 'swr'
import useSWRInfinite from 'swr/infinite'
import useSWR from 'swr'
import axios from 'axios'
import { useEffect, useState } from 'react'

import { Post } from '../types'
import PostCard from '../components/PostCard'
import Loading from '../components/loading'
import SubList from '../components/SubList'
import ProfileButton from '../components/ProfileButton'

import { MdKeyboardArrowRight } from 'react-icons/md'
import Link from 'next/link'
import { IoClose } from 'react-icons/io5'
import { useRouter } from 'next/router'


interface Props {
  fallback: {
    [key: string]: any
  }
}

const Home: NextPage<Props> = ({ fallback }) => {
  return (
    <SWRConfig value={{ fallback }}>
      <HomeInner />
    </SWRConfig>
  )
}

export default Home



const HomeInner = () => {
  const [isDelayLoading, setIsDelayLoading] = useState(false)
  const [observedPost, setObservedPost] = useState('')
  const [clickedPosts, setClickedPosts] = useState<{ [key: string]: boolean }>({})
   const router = useRouter();

  // 무한 스크롤 

  const getKey = (pageIndex: number, previousPageData: Post[]) => {
    if (previousPageData && !previousPageData.length) return null
    return `/posts?page=${pageIndex}`
  }

  const {
    data,
    error,
    size,
    setSize,
    mutate,
  } = useSWRInfinite<Post[]>(getKey)

  useEffect(() => {
    setSize(1)   
  }, [])

  const posts: Post[] = data ? ([] as Post[]).concat(...data) : []
  const isInitialLoading = !data && !error

  console.log("posts", posts);

  //  저장한 게시물 

  const { data: savedPosts, mutate: mutateSaved } = useSWR<Post[]>('/saved')
  console.log("savedPosts", savedPosts);  

  //  북마크 클릭 

  const handleClick = async (post: Post) => {
    setClickedPosts(prev => ({ ...prev, [post.identifier]: true }))

      try {
        await axios.post(`/posts/${post.identifier}/${post.slug}/save`)
        mutate()
        mutateSaved()
        setClickedPosts({})
      } catch (e) {
        mutate()
        mutateSaved()
      }
  }

  //  Intersection Observer 

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
            setSize(size + 1)
            setIsDelayLoading(false)
          }, 1000)
        }
      },
      { threshold: 1 }
    )

    observer.observe(element)
  }


  return (
    <div className="flex max-w-6xl mx-auto relative shadow-lg">
      {/* 메인 피드 */}
      <div className="px-4 flex-1 mt-10 pt-10">
        {isInitialLoading && <Loading />}

        {posts.map(post => (
          <PostCard
            key={post.identifier}
            post={post}
            mutate={mutate}
            mutateSaved={mutateSaved}
          />
        ))}

        {isDelayLoading && (
          <div className="flex justify-center py-6">
            <Loading />
          </div>
        )}
      </div>

      {/* 우측 사이드바 */}
      <div className="hidden w-[302px] md:block bg-blue-500 h-screen">
        <div className="bg-white h-screen px-6 py-4 fixed w-[302px] z-20 border-l border-gray-300">
          <ProfileButton />
          <SubList />

          {/* 저장한 게시물 */}
          <div className="p-1 mt-6">
            <h3 className="font-semibold">최근 저장한 게시물</h3>

            {!savedPosts || savedPosts.length === 0 && (
              <p className="text-sm ml-4 text-gray-500 mt-2">
                저장한 게시물이 없습니다.
              </p>
            )}

            {savedPosts?.map((post, index) => (
              <div key={post.identifier}>
                <div
                  className={` flex px-2 py-3 rounded-xl hover:translate-x-1 ease-in duration-200 ${
                    index === 0 ? 'bg-white' : ''
                  }`}
                >
                    <MdKeyboardArrowRight className="w-6 h-6 fill-blue-500" />

                  <Link
                    href={post.url}
                    className="ml-1 text-sm  truncate flex-1 font-light"
                  >
                    {post.title}

                  </Link>
                  <button
                    onClick={() => handleClick(post)}
                    className="text-blue-500 flex items-center gap-1 "
                  >
                    {!clickedPosts[post.identifier] && (
                      <IoClose className='w-5 h-5  fill-gray-500 hover:bg-blue-100 rounded-full'/>
                      
                    )}
                  </button>
                </div>
                {index !== savedPosts.length - 1 && (
                    <div className="w-11/12 mx-auto h-[1px] bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

  //  SSR

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + '/api'
  const cookie = req.headers.cookie || ''

  let user = null

  const [postsRes, subsRes, savedRes, countRes, meRes] =
    await Promise.allSettled([
      axios.get(`${baseURL}/posts?page=0`, {
        headers: { cookie },
        withCredentials: true,
      }),
      axios.get(`${baseURL}/subs/sub/topSubs`),
      axios.get(`${baseURL}/saved`, {
        headers: { cookie },
        withCredentials: true,
      }),
      axios.get(`${baseURL}/users/count`, {
        headers: { cookie },
        withCredentials: true,
      }),
      axios.get(`${baseURL}/auth/me`, {
        headers: { cookie },
        withCredentials: true,
      }),
    ])

  if (meRes.status === 'fulfilled') {
    user = meRes.value.data
  }

  return {
    props: {
      user,
      fallback: {
        '/posts?page=0':
          postsRes.status === 'fulfilled'
            ? postsRes.value.data
            : [],
        '/subs/sub/topSubs':
          subsRes.status === 'fulfilled'
            ? subsRes.value.data
            : [],
        '/saved':
          savedRes.status === 'fulfilled'
            ? savedRes.value.data
            : [],
        '/users/count':
          countRes.status === 'fulfilled'
            ? countRes.value.data
            : null,
      },
    },
  }
}