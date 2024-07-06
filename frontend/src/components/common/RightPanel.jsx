import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import {useQuery} from "@tanstack/react-query"
import toast from "react-hot-toast";
import UsersList from "./UsersList";

const RightPanel = () => {

	const {data:USERS_FOR_RIGHT_PANEL, isLoading, isError, error} = useQuery({
		queryKey: ['suggestedUser'],
		queryFn: async () => {
			try {
				const res = await fetch('/api/users/suggested');
				const data = res.json();

				if(!res.ok){
					throw new Error(data.error || "Something went wrong");
				}

				return data;
			} catch (error) {
				toast.error(error.message);
			}
		}
	});

	// If there are no users to follow then there will be an empty div so that the post section doesn't stretch
	if(USERS_FOR_RIGHT_PANEL?.length === 0) return <div className="md:w-64 w-0"></div>

	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
				<p className='font-bold'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						USERS_FOR_RIGHT_PANEL?.map((user) => (
							<UsersList user={user} from={"RightPanel"} key={user._id}/>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;