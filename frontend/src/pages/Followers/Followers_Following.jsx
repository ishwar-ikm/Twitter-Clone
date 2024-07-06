import React from 'react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import UsersList from '../../components/common/UsersList'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

const Followers_Following = () => {
  const { username, type } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ["followData"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}/connections?type=${type}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        navigate(-1);
      }
    },
    retry: false
  })
  return (
    <div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
      <div className='flex justify-between items-center p-4 border-b border-gray-700'>
        <p className='font-bold capitalize'>{type}</p>
      </div>
      {(isLoading || isRefetching) && (
        <div className='flex justify-center h-full items-center'>
          <LoadingSpinner size='lg' />
        </div>
      )}
      {!isLoading && !isRefetching && data?.length === 0 && <div className='text-center p-4 font-bold'>No { type }</div>}
      {!isLoading && !isRefetching && data?.map((user) => (
        <div className='flex w-full justify-around gap-2 p-4 border-b border-gray-700' key={user._id}>
          <UsersList user={user} />
        </div>
      ))}
    </div>
  )
}

export default Followers_Following
