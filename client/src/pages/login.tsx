import React, { FormEvent, useState } from 'react'
import InputGroup from '../components/InputGroup'
import Link from 'next/link'
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuthDispatch, useAuthState } from '../context/auth';

const Login = () => {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<any>({});
    const { authenticated } = useAuthState();
    const dispatch = useAuthDispatch();

    if (authenticated) router.push("/");

     const handleGuestLogin = async () => {
        try {
            const res = await axios.post("/auth/guest", {},  { withCredentials: true })
            dispatch("LOGIN", res.data);
            router.push("/")
        } catch (error) {
            console.log(error);
        }
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const res = await axios.post("/auth/login", { password, username }, { withCredentials: true })

            dispatch("LOGIN", res.data);

            router.push("/")
        } catch (error: any) {
            console.log(error);
            setErrors(error.response?.data || {})
        }
    }

    return (
        <div className='bg-white'>
            <div className='flex flex-col items-center justify-center h-screen p-6 '>
                <div className='w-38 mx-auto md:w-96 '>  
                    <div className='flex flex-col gap-6 mb-12'>
                        <img src="logo.png" alt="logo" className='w-full h-20 ' />
                        <h2 className='text-center text-lg'>이야기의 파도에 올라타 보세요!</h2>
                    </div>
                    <h1 className='mb-4  font-bold text-center text-2xl'>로그인</h1>
                    <form onSubmit={handleSubmit} className='group'>
                        <InputGroup
                            placeholder='Username'
                            value={username}
                            setValue={setUsername}
                            error={errors.username}
                            required
                        />
                        <InputGroup
                            placeholder='Password'
                            value={password}
                            setValue={setPassword}
                            error={errors.password}
                            required
                        />
                        <button
                             className='w-full py-3 mb-1 text-white bg-blue-300 rounded-xl  group-valid:bg-blue-500 group-valid:text-white '>
                            로그인
                        </button>
                    </form>
                    <small>
                        아직 아이디가 없나요?
                        <Link
                            href="/register"
                            className='ml-1 text-blue-500 uppercase'
                        >
                            회원가입
                        </Link>
                    </small>
                    <button 
                        type="button"
                        className='w-full py-3 mt-4 text-white bg-gray-500 rounded-xl hover:bg-gray-400'
                        onClick={handleGuestLogin}
                    >
                        게스트로 로그인하기
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login
