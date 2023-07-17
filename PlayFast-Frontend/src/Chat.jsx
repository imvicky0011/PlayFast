/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import Avatar from "./Avatar";
import Logo from "./Logo";

export default function Chat() {

  const [ws, setWs] = useState(null)
  const [onlinePeople, setOnlinePeople] = useState({})
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [newMessageText, setNewMessageText] = useState('')
  const [messages, setMessages] = useState([])
  const {username, id, setId, setUsername} = useContext(UserContext)

  console.log("ENTIRE CHAT COMP RERENDERED")
  console.log(messages)

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
    } else {
      console.log(messageData)
      setMessages(prev => ([...prev, {isOur: false, text: messageData.text}]))
    }
  }

  function sendMessage(ev) {
    ev.preventDefault()
    console.log("im trying to send this msg : ", newMessageText)
    ws.send(JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText
    }))
    setNewMessageText('')
    console.log("message sent to the server")
    setMessages(prev => ([...prev, {text: newMessageText, isOur: true}]))
  }

  const onlineExceptMe = {...onlinePeople}
  delete onlineExceptMe[id]


  

  //the structure of the chat page
  return (
    <div className="flex h-screen">
      
      <div className="bg-white w-1/3 pl-4 pt-4">
        
        <Logo/>

        {Object.keys(onlineExceptMe).map(userId => (
          <div
            onClick={() => setSelectedUserId(userId)}
            key = {userId} 
            className={"border-b border-gray-100 flex items-center gap-3 cursor-pointer " + (userId === selectedUserId ? 'bg-blue-100' : '')} 
          > 
            {userId === selectedUserId && (
              <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
            )}

            <div className="flex gap-2 py-2 pl-4 items-center">
            <Avatar username = {onlinePeople[userId]} userId = {userId} />
            <span className="text-gray-800"> { onlinePeople[userId] } </span> 
            </div>
          </div>
        ))}

      </div>



      {/* //Chatting with the selected person */}
      <div className="flex flex-col bg-blue-100 w-2/3 p-2">
        
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-600">&larr; Select a Person from the Available List</div>
            </div>
          )}
          {selectedUserId && (
            <div>
              {messages.map(message => (
                <div> {message.text} </div>
              ))}
            </div>
          )}
        </div>
        
        { selectedUserId &&
        <form className="flex gap-2" onSubmit={sendMessage}>
          <input
            value={newMessageText}
            onChange={(ev) => setNewMessageText(ev.target.value)}
            type="text"
            placeholder="Type your message here"
            className="bg-white border p-2 flex-grow rounded-sm"
          />
          <button 
            type="submit"
            className="bg-blue-500 p-2 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        }
      </div>
    </div>
  );
}

