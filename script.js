const socket = io('http://localhost:5000');
const loginScreen = document.getElementById('login-screen');
const loginInput = document.getElementById('login-input');
const loginButton = document.getElementById('login-button');
const chatScreen = document.getElementById('chat-screen');
const chatPanel = document.getElementById('chat-panel-top');
const fileSender = document.getElementById('send-file');
const chatTextInput = document.getElementById('chat-text-input');
const activeUsers = document.getElementById('active-users');
const activeChatrooms = document.getElementById('active-chatrooms');
const sendMessageButton = document.getElementById('send-button');
const createChatroomButton = document.getElementById('create-chatroom-button');
const emotes = [...document.getElementsByTagName('td')];

const MESSAGETYPE = {
    TEXT : 0,
    FILE : 1 
}

class User {
    constructor(id,username) {
        this.id = id;
        this.username = username;
    }
}
class Message {
    constructor(type,senderId,senderName,receiverId,content,contentDetails = {}) {
        this.type = type;
        this.senderId = senderId;
        this.senderName = senderName;
        this.receiverId = receiverId;
        this.content = content;
        this.contentDetails = contentDetails;
    }

    logMessage() {
        console.log(this.type,this.senderId,this.senderName,this.content);
    }
}

emotes.forEach((item) => {
    item.addEventListener('click', () => {
        chatTextInput.value = chatTextInput.value + item.innerText;
    })
})

let clientUsername = "anonymous";
let activeChats = {

}
let selectedChat = null;
let onlineUsers = [];
let onlineChatrooms = [];

//file input
function upload(files) {
    if(selectedChat !== null) {
        let msg = new Message(MESSAGETYPE.FILE,socket.id,clientUsername,selectedChat,files[0],{name:files[0].name,type:files[0].type});
        socket.emit("upload",msg);
        if(activeChats[selectedChat] === undefined) activeChats[selectedChat] = [];
        activeChats[selectedChat].push(msg);
        updateChat();
    }
}

//username input
loginButton.addEventListener("click", () => {
    if(loginInput.value.length > 6) {
        clientUsername = loginInput.value;
        socket.emit("login-info", loginInput.value);
        loginScreen.style = "display: none;";
        chatScreen.style = "";
    } 
    else {
        alert("Username Must Be Longer Than 6 Characters");
    }
});

//send message
sendMessageButton.addEventListener('click',() => {
    if(chatTextInput.value.length > 0 && selectedChat !== null) {
        let msg = new Message(MESSAGETYPE.TEXT,socket.id,clientUsername,selectedChat,chatTextInput.value);
        chatTextInput.value = '';
        socket.emit('message-receiver',JSON.stringify(msg));
        if(activeChats[selectedChat] === undefined) activeChats[selectedChat] = [];
        activeChats[selectedChat].push(msg);
        updateChat();
    }
})

//create chatroom
createChatroomButton.addEventListener('click',() => {
    let chatroomName = prompt("Enter a name for the chatroom")
    if(chatroomName !== null) {
        socket.emit("create-chatroom",chatroomName,(response) => {
            alert(response);
        });
    }
})

//get message from other users
socket.on("message-receiver",(msg) => {
    if(msg.senderId === socket.id) return;
    if(msg.receiverId === socket.id) {
        if(activeChats[msg.senderId] === undefined) {
            activeChats[msg.senderId] = [];
        }
        activeChats[msg.senderId].push(msg)
        if(msg.senderId === selectedChat) {
            updateChat();
        }
    }
    else {
        if(activeChats[msg.receiverId] === undefined) {
            activeChats[msg.receiverId] = [];
        }
        activeChats[msg.receiverId].push(msg);
        if(msg.receiverId === selectedChat) {
            updateChat();
        }
    }
    
})


//get opened chatrooms
socket.on("get-chatrooms",(data) => {
    onlineChatrooms = JSON.parse(data);
    let customButton;
    for(let i = 0 ; i < activeChatrooms.children.length ; i++) {
        if(activeChatrooms.children[i].id === "create-chatroom-button") {
            customButton = activeChatrooms.children[i];
        }
    }
    activeChatrooms.innerHTML = '';
    activeChatrooms.appendChild(customButton)
    onlineChatrooms.forEach((item) => {
        let div = document.createElement("div");
        div.addEventListener("click", () => {
            activeChatrooms.childNodes.forEach((item) => {
                item.classList.remove("selected-chat")
            })
            activeUsers.childNodes.forEach((item) => {
                item.classList.remove("selected-chat")
            })
            selectedChat = item;
            socket.emit("join-chatroom",item);
            div.classList.add("selected-chat")
            if(activeChats[selectedChat] === undefined) {
                activeChats[selectedChat] = [];
            }
            updateChat();
        })
        let span = document.createElement("span");
        span.textContent = item;
        span.className = "active-users-item-span"
        div.className = "active-users-item";
        div.appendChild(span)
        activeChatrooms.appendChild(div);
    })
})

socket.on("get-users", (data) => {
    let initialData = JSON.parse(data);
    delete initialData[socket.id] 
    onlineUsers = [];
    for(const key in initialData) {
        onlineUsers.push(new User(key,initialData[key]));
    }
    activeUsers.innerHTML = '';
    onlineUsers.forEach((item) => {
        let div = document.createElement("div");
        div.addEventListener("click", () => {
            activeUsers.childNodes.forEach((item) => {
                item.classList.remove("selected-chat")
            })
            activeChatrooms.childNodes.forEach((item) => {
                item.classList.remove("selected-chat")
            })
            selectedChat = item.id;
            div.classList.add("selected-chat")
            if(activeChats[selectedChat] === undefined) {
                activeChats[selectedChat] = [];
            }
            updateChat();
        })
        let span = document.createElement("span");
        span.textContent = item.username;
        span.className = "active-users-item-span"
        div.className = "active-users-item";
        div.appendChild(span)
        activeUsers.appendChild(div);
    })
});

const updateChat = () => {
    const messages = activeChats[selectedChat];
    chatPanel.innerHTML = '';
    messages.forEach((msg) => {
        if(msg.type === MESSAGETYPE.TEXT) {
            const messageDiv = document.createElement('div');  messageDiv.className = (msg.senderId === socket.id ? "message-current-user" : "message-another-user") ;
            const senderNameHeader = document.createElement('h3'); senderNameHeader.innerText = msg.senderName;
            const senderMessageP = document.createElement('p'); senderMessageP.innerText = msg.content;
            const contentDiv = document.createElement('div'); contentDiv.classList = "content-div"
            contentDiv.appendChild(senderMessageP);
            messageDiv.appendChild(senderNameHeader); messageDiv.appendChild(contentDiv);
            chatPanel.appendChild(messageDiv);
        }
        else if(msg.type = MESSAGETYPE.FILE) {
            const messageDiv = document.createElement('div');  messageDiv.className = (msg.senderId === socket.id ? "message-current-user" : "message-another-user") ;
            const senderNameHeader = document.createElement('h3'); senderNameHeader.innerText = msg.senderName;
            const downloadDiv = document.createElement('div'); downloadDiv.className = "download-div"
            const downloadLink = document.createElement('a'); downloadLink.className = "download-class"
            let binaryData = [msg.content];
            downloadLink.href = URL.createObjectURL(new Blob(binaryData, {type: msg.contentDetails.type}));
            downloadLink.download = msg.contentDetails.name
            downloadLink.innerText = msg.contentDetails.name
            messageDiv.appendChild(senderNameHeader); 
            downloadDiv.appendChild(downloadLink)
            messageDiv.appendChild(downloadDiv);
            chatPanel.appendChild(messageDiv);
        }
    })
    chatPanel.scrollTop = chatPanel.scrollHeight;
}