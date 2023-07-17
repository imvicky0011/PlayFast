import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";

export default function Chat() {

  const [ws, setWs] = useState(null)
  const {username, id, seId, setUsernam} = useContext(UserContext)
  const [onlinePeople, setOnlinePeople] = useState({})

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4040')
    setWs(ws)
    ws.addEventListener('message', handleMesage)
  }, [])


  function showOnlinePeople(peopleArray) {
    const people = {}
    
    peopleArray.forEach(({userId, username}) => {
      people[userId] = username
    })
    console.log(people)
    setOnlinePeople(people)
  }

  function handleMesage(ev) {
    const messageData = JSON.parse(ev.data)
    
    if('online' in messageData) {
      showOnlinePeople(messageData.online)
    }
  }



  //the structure of the chat page
  return (
    <div className="flex h-screen">
      
      <div className="bg-blue-100 w-1/3">
        {Object.keys(onlinePeople).map(userId => (
          <div key = {userId} className="border-b border" > { onlinePeople[userId] } </div>
        ))}
      </div>


      <div className="flex flex-col bg-blue-300 w-2/3 p-2">
        
        <div className="flex-grow">messages with the selected person</div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message here"
            className="bg-white border p-2 flex-grow rounded-sm"
          />
          <button className="bg-blue-500 p-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

