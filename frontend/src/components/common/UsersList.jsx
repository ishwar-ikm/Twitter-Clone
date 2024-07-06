import React from 'react'
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import useFollow from '../../hooks/useFollow';
import { useQuery } from '@tanstack/react-query';

const UsersList = ({user, from}) => {
	
	const {follow, isPending} = useFollow();
	const {data:authUser} = useQuery({queryKey: ["authUser"]});

	return (
		<Link
			to={`/profile/${user.username}`}
			className='flex w-full items-center justify-between gap-4'
			key={user._id}
		>
			<div className='flex gap-2 items-center'>
				<div className='avatar'>
					<div className='w-8 rounded-full'>
						<img src={user?.profileImg || "/avatar-placeholder.png"} alt="Profile" />
					</div>
				</div>
				<div className='flex flex-col'>
					<span className={`font-semibold tracking-tight ${from === 'RightPanel' ? 'truncate w-28' : ''}`}>
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
					{isPending ? <LoadingSpinner /> : (authUser.following.includes(user._id) ? "Unfollow" : "Follow")}
				</button>
			</div>
		</Link>
	)
}

export default UsersList
