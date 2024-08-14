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
const chatInputElement = document.querySelector('chat_message_input')

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

    chatSocket.onmessage = (e) => {console.log('Message')}
    chatSocket.onclose = (e) => {console.log("chat closed")}
    chatSocket.onopen = (e) => {console.log("Chat opened")}
    
}

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

    chatWelcomeElement.classList.add('hidden')
    chatRoomElement.classList.remove('hidden')

    joinChatRoom();

    return false
}