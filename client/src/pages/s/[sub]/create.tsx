import axios from 'axios';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { ChangeEventHandler, FormEvent, useRef, useState } from 'react'
import { Post } from '../../../types';

const PostCreate = () => {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const imageRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<Array<{ dataUrl: string, file: File } | null>>([]);
    const router = useRouter();
    const { sub: subName } = router.query;

    const onClickButton = () => {
        imageRef.current?.click();
    }

    const onRemoveImage = (index: number) => () => {
        setPreview((prevPreview) => {
        const prev = [...prevPreview];
        prev[index] = null;
        return prev;
        })
    }

    const onUpload: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    if (e.target.files) {
      Array.from(e.target.files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview((prevPreview) => {
            const prev = [...prevPreview];
            prev[index] = {
              dataUrl: reader.result as string,
              file,
            };
            return prev;
          })
        };
        reader.readAsDataURL(file);
      })
    }
  };

    const submitPost = async (e: FormEvent) => {
        e.preventDefault();
        if (body.trim() === "" || !subName) return;

        const formData = new FormData();
        // formData.append("title", title.trim());
        formData.append("body", body);
        formData.append("sub", subName as string);

        preview.forEach((p) => {
            if (p) formData.append("images", p.file);
        });

        try {
            const { data: post } = await axios.post<Post>("/posts", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            router.push(`/s/${subName}/${post.identifier}/${post.slug}`)
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className='w-4/6 mt-20 mx-auto'>

                <div className='p-4 mx-auto mt-40 bg-white rounded-2xl w-5/6 md:w-4/6'>
                    <h1 className='mb-3 text-lg'>포스트 생성하기</h1>
                    <form onSubmit={submitPost}>
                        {/* <div className='relative mb-2'>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                placeholder="제목"
                                maxLength={20}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <div
                                style={{ top: 10, right: 10 }}
                                className="absolute mb-2 text-sm text-gray-400 select-none"
                            >
                                {title.trim().length}/20
                            </div>
                        </div> */}
                        <textarea
                            rows={4}
                            placeholder="설명"
                            className='w-full p-3 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500'
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                        <div style={{ display: 'flex' }}>
                        {preview.map((v, index) => (
                            v && <div key={index} style={{ flex: 1 }} onClick={onRemoveImage(index)}>
                            <img src={v.dataUrl} alt="미리보기" style={{objectFit: "contain", width: '100%', maxHeight: 100}} />
                            </div>
                        ))}
                        </div>
                            <input type="file" name="images" multiple hidden ref={imageRef} onChange={onUpload} />
                                <button 
                                    className="w-[34px] h-[34px] border-0 cursor-pointer rounded-full transition-colors duration-200 bg-[rgba(29,155,240,0.01)] flex items-center justify-center" 
                                    type="button" 
                                    onClick={onClickButton}
                                >
                                    <svg width={24} viewBox="0 0 24 24" aria-hidden="true">
                                    <g>a
                                        <path
                                        d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path>
                                    </g>
                                    </svg>
                                </button>
                        <div className='flex justify-end'>
                            <button
                                className='px-4 py-1 text-sm font-semibold text-white bg-gray-400 border rounded'
                            >
                                생성하기
                            </button>
                        </div>
                    </form>
                </div>
            </div>
    )
}

export default PostCreate

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
        const cookie = req.headers.cookie;
        if (!cookie) throw new Error("쿠키가 없습니다.")

        await axios.get(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api/auth/me`,
            { headers: { cookie } })
        return { props: {} }
    } catch (error) {
        res.writeHead(307, { Location: "/login" }).end()
        
        return { props: {} }
    }
}