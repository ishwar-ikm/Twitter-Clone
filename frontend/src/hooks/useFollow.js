import {useMutation, useQueryClient} from "@tanstack/react-query"
import toast from "react-hot-toast";


const useFollow = () => {
  const queryClient = useQueryClient();

  const {mutate:follow, isPending, isError, error} = useMutation({
    mutationFn: async (userId) => {
        try {
            const res = await fetch (`/api/users/follow/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });
    
            const data = await res.json();
    
            if(!res.ok){
                throw new Error(data.error || "Something went wrong");
            }
    
            return data;
        } catch (error) {
            throw error;
        }
    },
    onSuccess: () => {
        Promise.all([
            queryClient.invalidateQueries({queryKey: ['suggestedUser']}),
            queryClient.invalidateQueries({queryKey: ["authUser"]}),
        ]);
    },

    onError: () => {
        toast.error(error.message);
    }
  });

  return {isPending, follow}
}

export default useFollow
