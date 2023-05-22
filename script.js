const socket = io('http://localhost:5000');
const loginScreen = document.getElementById('login-screen');
const loginInput = document.getElementById('login-input');
const loginButton = document.getElementById('login-button');
const chatScreen = document.getElementById('chat-screen');

    loginButton.addEventListener("click",() => {
        if(loginInput.value.length > 6) {
            socket.emit("login-info",loginInput.value);
            loginScreen.style = "display: none;"
            chatScreen.style = ""
        }
        else {
            alert("Username Must Be Longer Than 6 Characters")
        }
        
    })




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