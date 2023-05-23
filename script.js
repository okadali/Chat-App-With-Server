const socket = io('http://localhost:5000');
const loginScreen = document.getElementById('login-screen');
const loginInput = document.getElementById('login-input');
const loginButton = document.getElementById('login-button');
const chatScreen = document.getElementById('chat-screen');
const chatTextInput = document.getElementById('chat-text-input');
const activeUsers = document.getElementById('active-users');
const emotes = [...document.getElementsByTagName('td')];


class User {
    constructor(id,username) {
        this.id = id;
        this.username = username;
    }
}

emotes.forEach((item) => {
    item.addEventListener('click', () => {
        chatTextInput.value = chatTextInput.value + item.innerText;
    })
})



var onlineUsers = [];
var selectedPersonToChat;

loginButton.addEventListener("click", () => {
    if(loginInput.value.length > 6) {
        socket.emit("login-info", loginInput.value);
        loginScreen.style = "display: none;";
        chatScreen.style = "";
    } 
    else {
        alert("Username Must Be Longer Than 6 Characters");
    }
});

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
            selectedPersonToChat = item.id;
            console.log(item.id);
        })
        let span = document.createElement("span");
        span.textContent = item.username;
        span.className = "active-users-item-span"
        div.className = "active-users-item";
        div.appendChild(span)
        activeUsers.appendChild(div);
    })
}); 




    // socket.on("chat-message",(data) => {
    //     console.log('😉');
    // })

    // socket.on("listen-broadcast",(data) => {
    //     console.log("BROADCAST MESSAGE: "+data);
    // })

    // messageForm.addEventListener('submit',e => {
    //     e.preventDefault();
    //     const message = messageInput.value
    //     socket.emit('send-chat-message',message);
    //     messageInput.value = '';
    // })