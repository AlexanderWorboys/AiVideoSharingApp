import { useEffect, useState } from "react";
import { Alert } from "react-native";

//one fucntion that communitcates to database
const useAppwrite = (fn) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
  
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const response = await fn();

        setData(response);
      } catch (error) {
        Alert.alert('Error', error.message)
      } finally {
        setIsLoading(false);
      }
    }

    useEffect(() => {
      fetchData();
    }, []);

    // for when refetching is called
    const refetch = () => fetchData();
  
    return { data, isLoading, refetch }
}

export default useAppwrite;