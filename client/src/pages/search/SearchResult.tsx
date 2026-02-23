import { useState, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import PostCard from "../../components/PostCard";
import { Post } from "../../types";
import Loading from "../../components/loading";

type Props = {
  q: string;
};

export default function SearchResult({ q }: Props) {
  const [observedPost, setObservedPost] = useState("");
  const [delay, setDelay] = useState(false);

  

  // SWRInfinite 키 생성 함수
  const getKey = (pageIndex: number, previousPageData: Post[] | null) => {
    if (!q) return null;
    if (previousPageData && previousPageData.length === 0) return null; 
    return `/posts/search?q=${encodeURIComponent(q)}&page=${pageIndex}&count=8`;
  };

  const { data, error, size, setSize, mutate } = useSWRInfinite<Post[]>(getKey, {
    dedupingInterval: 60 * 1000, // staleTime 대응 (같은 key로 1분 이내 재요청시 기존 요청 재사용)
  });
  console.log("data:", data);

  const posts: Post[] = data ? ([] as Post[]).concat(...data) : [];
  const isLoading = !data && !error;

  // 마지막 포스트 관찰
  useEffect(() => {
    if (!posts || posts.length === 0) return;
    const id = posts[posts.length - 1].identifier;
    if (id !== observedPost) {
      setObservedPost(id);
      observeElement(document.getElementById(id));
    }
  }, [posts]);

  const observeElement = (element: HTMLElement | null) => {
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) =>  {
        if (entries[0].isIntersecting === true) {
          observer.unobserve(element);
          console.log("마지막 포스트에 왔습니다.");
          setDelay(true);
          setTimeout(() => {
            setSize((size) => size + 1);
            setDelay(false);
          }, 1500);
        }
      },
      { threshold: 1 }
    );
    observer.observe(element);
  }

  if (isLoading) return <Loading />;
  if (error) return <p className="text-center text-red-500">검색 중 오류가 발생했습니다.</p>;
  if (posts.length === 0) return <p className="text-center">검색 결과가 없습니다.</p>;

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.identifier} post={post} mutate={mutate} />
      ))}
      {delay && (
          <Loading />
      )}
    </div>
  );
}
