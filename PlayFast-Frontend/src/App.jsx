import axios from "axios";
import {UserContextProvider} from "./UserContext";
import Routes from "./Routes";

function App() {
  axios.defaults.baseURL = 'http://localhost:4040';
  axios.defaults.withCredentials = true;

  // useEffect(() => {
  //   axios.get('/profile').then(res => console.log(res)).catch(err => console.log(err))
  // }, [])

  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  )
}

export default App