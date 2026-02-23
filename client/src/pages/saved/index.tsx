import axios from "axios";
import React, { useEffect, useState } from "react";
import useSWRInfinite from "swr/infinite";
import PostCard from "../../components/PostCard";
import Loading from "../../components/loading";
import { Post } from "../../types";
import useSWR from "swr";
import { useAuthState } from "../../context/auth";
import { useRouter } from "next/router";

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const SavedPostsPage = () => {
  const [isDelayLoading, setIsDelayLoading] = useState(false);
  const [observedPost, setObservedPost] = useState("");
  const { authenticated } = useAuthState();
  const router = useRouter();
  
    useEffect(() => {
      setSize(1)   
    }, [])
  
  // 무한 스크롤 getKey
  const getKey = (pageIndex: number, previousPageData: Post[]) => {
    if (previousPageData && !previousPageData.length) return null; // 더 이상 불러올 데이터 없음
    return `/posts/saved?page=${pageIndex}`;
  };

  const { data, size, setSize, mutate } = useSWRInfinite<Post[]>(getKey, fetcher);
  const posts: Post[] = data ? ([] as Post[]).concat(...data) : [];

  // SWR로 전체 저장 게시물 동기화용
  const { mutate: mutateSaved } = useSWR<Post[]>("/posts/saved");

  // IntersectionObserver 
  useEffect(() => {
    if (!posts.length) return;
    const lastId = posts[posts.length - 1].identifier;
    if (lastId !== observedPost) {
      setObservedPost(lastId);
      observeElement(document.getElementById(lastId));
    }
  }, [posts]);

  const observeElement = (element: HTMLElement | null) => {
    if (!element) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          observer.unobserve(element);
          setIsDelayLoading(true);
          setTimeout(() => {
            setSize(size + 1);
            setIsDelayLoading(false);
          }, 500); // 로딩 딜레이
        }
      },
      { threshold: 1 }
    );
    observer.observe(element);
  };

  return (
    <div className="px-4 w-4/6 mt-20 mx-auto max-md:w-full">
      {!authenticated ? ( 
        <h2 className="pt-2 text-xl font-bold mb-4 max-md:text-md">로그인 후 게시물을 저장 해보세요! </h2>
      ):(
        <h2 className="pt-2 text-xl font-bold mb-4 max-md:text-md">저장한 게시물 목록입니다</h2>
      )}

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

      {posts.length === 0 && !isDelayLoading && authenticated && (
        <p className="text-gray-500 mt-4">저장된 게시물이 없습니다.</p>
      )}
      
    </div>
  );
};

export default SavedPostsPage;
