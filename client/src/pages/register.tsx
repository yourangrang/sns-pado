import axios from 'axios';
import Link from 'next/link'
import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react'
import InputGroup from '../components/InputGroup'
import { useAuthState } from '../context/auth';

const Register = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<any>({});
    const { authenticated } = useAuthState();

    const router = useRouter();
    if (authenticated) router.push("/");

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const res = await axios.post('/auth/register', {
                email,
                password,
                username
            });
            console.log('res', res);
            router.push("/login");
        } catch (error: any) {
            console.log('error', error);
            setErrors(error.response?.data || {});
        }
    }

    return (
        <div className='bg-white'>
            <div className='flex flex-col items-center justify-center h-screen p-6'>
                <div className='w-38 mx-auto md:w-96 '>  
                    <div className='flex flex-col gap-6 mb-12'>
                        <img src="logo.png" alt="logo" className='w-full h-20 ' />
                        <h2 className='text-center text-lg'>이야기의 파도에 올라타 보세요!</h2>
                    </div>
                    <h1 className='mb-4  font-bold text-center text-2xl'>회원가입</h1>
                    <form onSubmit={handleSubmit} className='group'>
                        <InputGroup
                            placeholder='Email'
                            value={email}
                            setValue={setEmail}
                            error={errors.email}
                            required
                        />
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
                             className='w-full py-2 mb-1 text-white bg-gray-400 rounded  group-valid:bg-blue-500 group-valid:text-white '>
                            회원가입
                        </button>
                    </form>
                    <small>
                        이미 가입하셨나요?
                        <Link
                            href="/login"
                            className='ml-1 text-blue-500 uppercase'
                        >
                            로그인
                        </Link>
                    </small>
                </div>
            </div>
        </div>
    )
}

export default Register
