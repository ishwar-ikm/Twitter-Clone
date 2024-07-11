import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import {useQuery} from "@tanstack/react-query"
import toast from "react-hot-toast";
import { useEffect } from "react";


const Posts = ({feedType, username, userId}) => {

	const getEndPoint = () => {
		switch(feedType){
			case "forYou":
				return "/api/posts/all";
			case "following":
				return "/api/posts/following";
			case "posts":
				return `/api/posts/user/${username}`;
			case "likes":
				return `/api/posts/likes/${userId}`;
			default:
				return "/api/posts/all";
		}
	}

	const {data:POSTS, isLoading, refetch, isRefetching} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const endpoint = getEndPoint();

				const res = await fetch(endpoint);
				const data = res.json();

				if(!res.ok){
					throw new Error(data.error);
				}

				return data;
			} catch (error) {
				toast.error(error);
			}
		}
	});

	useEffect(() => {
		refetch();
	}, [feedType, username]);

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!(isLoading || isRefetching) && POSTS?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!(isLoading || isRefetching) && POSTS && (
				<div>
					
					{POSTS.map((post) => (
						<Post key={post._id} post={post} username={username}/>
					))}
				</div>
			)}
		</>
	);
};
export default Posts;