/*
    Variables
*/

const chatRoom = document.querySelector('#room_uuid').textContent.replaceAll('"', '')


// Elements

const chatLogElement = document.querySelector('#chat_log')
const chatInputElement = document.querySelector('#chat_message_input')
const chatSubmitElement = document.querySelector('#chat_message_submit')

/**
 * Set up a web Socket
 * listen for the submit event
 * get the inputs.value and append it to the database and the chatlog
 * clear up the input place
 * submit by clicking enter key
 */

// Scroll to the bottom 
function scrollToBottom() {
    chatLogElement.scrollTop = chatLogElement.scrollHeight;
}

// Sending message to the server

function sendMessage() {
    const sendData = JSON.stringify({
        'type':'message',
        'message': chatInputElement.value,
        'agent': document.querySelector('#user_id').textContent.replaceAll('"', ''),
        'name': document.querySelector('#user_name').textContent.replaceAll('"', ''),
    })
    chatSocket.send(sendData)

    chatInputElement.value = '';
}

// updating the ui based on the message receve from the user
function onChatMessage(data){
    if (data.type == 'chat_message'){
        let tmpInfo = document.querySelector('.tmp-info')

        if (tmpInfo) {
            tmpInfo.remove()
        }
        if (!data.agent){
            chatLogElement.innerHTML += `
            <div class='flex w-full mt-2 space-x-3 max-w-md'>
                    <div class='flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2'>
                         ${data.intials}
                    </div>
                    <div>
                        <div class='bg-gray-300 p-3 rounded-l-lg rounded-br-lg'>
                            <p class='text-sm'>${data.message}</p>
                        </div>
                        <span class='text-xs text-gray-500 leading-none'>${data.created_at} ago...</span>
                    </div>
            </div>
        `
        }
        else {
            chatLogElement.innerHTML += `
                <div class='flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end'>
                    <div>
                        <div class='bg-blue-600 p-3 text-white rounded-l-lg rounded-br-lg'>
                        <p class='text-sm'>${data.message}</p>
                        </div>
                        <span class='text-xs text-gray-500 leading-none'>${data.created_at} ago...</span>
                    </div>
                    <div class='flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2'>
                    ${data.intials}
                    </div>
                </div>
            `
        }   
    }else if (data.type == 'writing_active'){
        if (!data.agent) {
            let tmpInfo = document.querySelector('.tmp-info')

            if (tmpInfo) {
                tmpInfo.remove()
            }
            
            chatLogElement.innerHTML += `
                <div class='tmp-info flex w-full mt-2 space-x-3 max-w-md'>
                        <div class='flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2'>
                             ${data.intials}
                        </div>
                        <div>
                            <div class='bg-gray-300 p-3 rounded-l-lg rounded-br-lg'>
                                <p class='text-sm'>Typing...</p>
                            </div>
                        </div>
                </div>
            `
            
        }
    }
    scrollToBottom()
}



chatSocket = new WebSocket(`
    ws://${window.location.host}/ws/chat/${chatRoom}/
   `)

   chatSocket.onmessage = (e) => {
    // show the data to in the text area
    onChatMessage(JSON.parse(e.data))
}
chatSocket.onclose = (e) => {console.log("chat closed")}
chatSocket.onopen = (e) => {scrollToBottom()}

document.addEventListener('DOMContentLoaded', () => {
    chatSubmitElement.onclick = function(e) {
        if (chatInputElement.value.trim().length === 0) 
            return;
        e.preventDefault()
        sendMessage()
        
        return false
    }
})

chatInputElement.onkeyup = function(e){e.key == 'Enter' ? chatSubmitElement.click(): ""}

chatInputElement.onfocus = function(e){
    const sendData = JSON.stringify({
        'type':'update',
        'message': 'writing_active',
        'agent': document.querySelector('#user_id').textContent.replaceAll('"', ''),
        'name': document.querySelector('#user_name').textContent.replaceAll('"', ''),
    })

    chatSocket.send(sendData)
}