const socket = io('http://localhost:5100');
const loginScreen = document.getElementById('login-screen');
const loginInput = document.getElementById('login-input');
const loginButton = document.getElementById('login-button');
const chatScreen = document.getElementById('chat-screen');
const chatPanel = document.getElementById('chat-panel-top');
const chatTextInput = document.getElementById('chat-text-input');
const activeUsers = document.getElementById('active-users');
const sendMessageButton = document.getElementById('send-button');
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
    constructor(type,senderId,senderName,receiverId,content) {
        this.type = type;
        this.senderId = senderId;
        this.senderName = senderName;
        this.receiverId = receiverId;
        this.content = content;
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

var clientUsername = "anonymous";
var activeChats = {

}
var selectedChat = null;
var onlineUsers = [];

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

sendMessageButton.addEventListener('click',() => {
    if(chatTextInput.value.length > 0 && selectedChat !== null) {
        let msg = new Message(MESSAGETYPE.TEXT,socket.id,clientUsername,selectedChat,chatTextInput.value);
        chatTextInput.value = '';
        socket.emit('message-receiver',JSON.stringify(msg));
    }
})

socket.on("message-receiver",(data) => {
    let msg = JSON.parse(data);
    if(activeChats[msg.senderId] === undefined) {
        activeChats[msg.senderId] = [];
    }
    activeChats[msg.senderId].push(JSON.parse(data))
    if(msg.senderId === selectedChat) {
        updateChat()
    }
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
            selectedChat = item.id;
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
        console.log(msg);
        if(msg.type = MESSAGETYPE.FILE && msg.senderId !== socket.id) {
            const messageDiv = document.createElement('div');  messageDiv.className = "message-another-user";
            const senderNameHeader = document.createElement('h3'); senderNameHeader.innerText = msg.senderName;
            const senderMessageP = document.createElement('p'); senderMessageP.innerText = msg.content;
            const contentDiv = document.createElement('div'); contentDiv.classList = "content-div"
            contentDiv.appendChild(senderMessageP);
            messageDiv.appendChild(senderNameHeader); messageDiv.appendChild(contentDiv);
            chatPanel.appendChild(messageDiv);
        }
    })
    chatPanel.scrollTop = chatPanel.scrollHeight;
}