import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import {useQuery} from "@tanstack/react-query"
import toast from "react-hot-toast";
import { useEffect } from "react";

const Posts = ({feedType}) => {

	const {data:POSTS, isLoading, refetch, isRefetching} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				let endpoint = "/api/posts/all";

				if(feedType === "following"){
					endpoint = "/api/posts/following";
				}

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
	}, [feedType]);

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
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;