// Vairables required for setting up the socketing or the new web socket
let chatName = '';
let chatSocket = null; 
let chatWindowUrl = window.location.href
let chatRoomUuid = Math.random().toString(36).slice(2,12)


// Elements

const chatElement = document.querySelector('#chat')
const chatOpenElement = document.querySelector('#chat_open')
const chatJoinElement = document.querySelector('#chat_join')
const chatIconElement = document.querySelector('#chat_icon')
const chatWelcomeElement = document.querySelector('#chat_welcome')
const chatRoomElement = document.querySelector('#chat_room')
const chatNameElement = document.querySelector('#chat_name')
const chatLogElement = document.querySelector('#chat_log')
const chatInputElement = document.querySelector('#chat_message_input')
const chatSubmitElement = document.querySelector('#chat_message_submit')


// Function for getting cookie(csrf_token)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// function for scrolling to bottm
function scrollToBottom() {
    chatLogElement.scrollTop = chatLogElement.scrollHeight;
}
function sendMessage() {
    chatSocket.send(JSON.stringify({
        'type':'message',
        'message': chatInputElement.value,
        'name': chatName,
    }))

    chatInputElement.value = '';
}

function onChatMessage(data){
    if (data.type == 'chat_message'){
        let tmpInfo = document.querySelector('.tmp-info')
        if (tmpInfo) {
            tmpInfo.remove()
        }
        if (data.agent){
            chatLogElement.innerHTML += `
            <div class='flex w-full mt-2 space-x-3 ma-w-md'>
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
                        <div class='bg-blue-600 p-3 rounded-l-lg rounded-br-lg text-white'>
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
    } else if (data.type == 'users_update'){
        chatLogElement.innerHTML += `<p class="mt-2">The admin/agent has joined the chat.</p>`
    } else if (data.type == 'writing_active'){
        if (data.agent){
            let tmpInfo = document.querySelector('.tmp-info')

            if (tmpInfo) {
                tmpInfo.remove()
            }
            
            chatLogElement.innerHTML += `
                <div class='tmp-info flex w-full mt-2 space-x-3 ma-w-md'>
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
//Function defintion for joining chat room
async function joinChatRoom(){
    /** 
     * Get the Room name
     * Create a Room uui
     * Get the data and append to a new form with new Form data 
     * submit that form to bakcned using fetch
     */ 

    chatName = chatNameElement.value;
    const data = new FormData()
    data.append('name', chatName)
    data.append('url', chatWindowUrl)

    await fetch(`/api/create-room/${chatRoomUuid}`, {
        method: 'POST',
        headers:{
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: data
    })
    .then(res => res.json())
    .then(res => console.log(res))

    // Create a new Web Socket 
    chatSocket = new WebSocket(`
        ws://${window.location.host}/ws/chat/${chatRoomUuid}/
        `)
    
    chatSocket.onmessage = (e) => {
        // show the data to in the text area
        onChatMessage(JSON.parse(e.data))
    }
    chatSocket.onclose = (e) => {scrollToBottom()}
    chatSocket.onopen = (e) => {console.log("Chat opened")}
    
}


document.addEventListener('DOMContentLoaded', () => {
// Event listener

chatOpenElement.onclick = function(e) {
    e.preventDefault()

    // Disappearing the open element and showing the welcomeElement
    chatIconElement.classList.add('hidden')
    chatWelcomeElement.classList.remove('hidden')

    return false;
}

chatJoinElement.onclick = function(e) {
    e.preventDefault()
    if (chatNameElement.value.trim().length === 0) 
        return;
    chatWelcomeElement.classList.add('hidden')
    chatRoomElement.classList.remove('hidden')

    joinChatRoom();

    return false
}

chatSubmitElement.onclick = function(e) {
    if (chatInputElement.value.trim().length === 0) 
        return;
    e.preventDefault()
    sendMessage()
    return false
}

chatInputElement.onkeyup = function(e){e.key == 'Enter' ? chatSubmitElement.click(): ""}
chatNameElement.onkeyup = function(e){e.key == 'Enter' ? chatJoinElement.click(): ""}

})


chatInputElement.onfocus = function(e){
    const sendData = JSON.stringify({
        'type':'update',
        'message': 'writing_active',
        'name': chatName,
    })

    chatSocket.send(sendData)
}
