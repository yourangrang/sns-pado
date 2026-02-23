import useSWRInfinite from 'swr/infinite'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Post } from '../../types'
import PostCard from '../../components/PostCard'
import Loading from '../../components/loading'
import useSWR from 'swr'
import { useRouter } from 'next/router'

export default function PopularPosts() {
 const [isDelayLoading, setIsDelayLoading] = useState(false)
  const [observedPost, setObservedPost] = useState('')
  const router = useRouter();

  useEffect(() => {
    setSize(1)   
  }, [])

 const fetcher = (url: string) =>
  axios.get(url).then(res => res.data)

  // 무한 스크롤 posts
  const getKey = (pageIndex: number, previousPageData: Post[]) => {
    if (previousPageData && !previousPageData.length) return null
    return `/posts/popular?page=${pageIndex}`
  }

  const {
    data,
    error,
    size,
    setSize,
    mutate
  } = useSWRInfinite<Post[]>(getKey, fetcher)


  const posts: Post[] = data ? ([] as Post[]).concat(...data) : []
  

  console.log("posts", posts);

  const { data: savedPosts, mutate: mutateSaved } = useSWR<Post[]>("/saved" );
  console.log('savedPosts',savedPosts);
  


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
      <div className='w-4/6 px-4 max-md:w-full mt-20 mx-auto'>
          <h2 className="pt-2 text-xl font-bold mb-4 ">현재 가장 인기있는 게시글입니다. </h2>
          {/* {isInitialLoading && <Loading />} */}

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
  )
}
