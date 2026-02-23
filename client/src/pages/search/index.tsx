import Head from "next/head";
import { useRouter } from "next/router";

import BackButton from "../../components/BackButton";
import SearchResult from "./SearchResult";

export default function Search() {
  const router = useRouter();
  const q = (router.query.q as string) || "";

  if (!q) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-500">검색어를 입력해주세요.</p>
      </div>
    );
  }


  return (
    <>
      <Head>
        <title>{q} - 검색 / Pado</title>
        <meta name="description" content={`${q} - 검색 / Pado`} />
      </Head>

      {/* 포스트 리스트 */}
        <div className='px-4 mb-2 w-full md:w-4/6 mt-20 mx-auto h-screen'>
        <div  className="flex items-center mb-3">
            <div className="w-1/2 justify-start">
              <BackButton />
            </div>
            <div className="w-1/2 text-gray-500 text-right">
              "{q}" 의 검색 결과 
            </div>
          </div>
          <SearchResult q={q} />
        </div>
    </>
  );
}
