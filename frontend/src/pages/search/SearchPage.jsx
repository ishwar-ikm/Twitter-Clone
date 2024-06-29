import { useMutation, useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { IoSearch } from 'react-icons/io5'
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const SearchPage = () => {

    const [searchInput, setSearchInput] = useState("");

    const [searchResult, setSearchResult] = useState([]);

    const { mutate: search, isPending } = useMutation({
        mutationFn: async () => {
            try {
                if (searchInput === "") {
                    throw new Error("Enter something to search");
                }
                const res = await fetch(`/api/users/searchUser/${searchInput}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        onSuccess: async (data) => {
            setSearchResult(data);
        },

        onError: async (error) => {
            toast.error(error.message);
        }
    });

    const handleSearch = () => {
        search();
    }

    return (
        <>
            <div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
                <div className='flex justify-between items-center p-4 border-b border-gray-700'>
                    <label className="flex-1 input input-bordered flex items-center gap-2 rounded-md">
                        <input type="text" className="grow" placeholder="Search" onChange={(e) => setSearchInput(e.target.value)} />
                    </label>
                    <button className="ml-5 rounded-lg btn btn-ghost"><IoSearch className='w-6 h-6' onClick={handleSearch} /></button>
                </div>
                {isPending && (
                    <div className='flex justify-center h-full items-center'>
                        <LoadingSpinner size='lg' />
                    </div>
                )}
                {searchResult?.length === 0 && <div className='text-center p-4 font-bold'>Find people you want to follow!</div>}
                {searchResult?.map((user) => (
                    <div className='border-b border-gray-700' key={user._id}>
                        <div className='flex gap-2 p-4'>
                            <div className='flex w-full justify-around'>
                                <Link
                                    to={`/profile/${user.username}`}
                                    className='flex w-full items-center justify-between gap-4'
                                    key={user._id}
                                >
                                    <div className='flex gap-2 items-center'>
                                        <div className='avatar'>
                                            <div className='w-8 rounded-full'>
                                                <img src={user.profileImg || "/avatar-placeholder.png"} alt="Profile" />
                                            </div>
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='font-semibold tracking-tight truncate'>
                                                {user.fullName}
                                            </span>
                                            <span className='text-sm text-slate-500'>@{user.username}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                follow(user._id);
                                            }}
                                        >
                                            {isPending ? <LoadingSpinner /> : "Follow"}
                                        </button>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>

    )
}

export default SearchPage
