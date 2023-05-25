const io = require("socket.io")(5000,{cors:{origin: "*"}})

var allClients = {};
var chatrooms = [];

const updateOnlineUsers = () => {
    io.emit("get-users",JSON.stringify(allClients));
}
const updateChatrooms = () => {
    io.emit("get-chatrooms",JSON.stringify(chatrooms));
}


io.on("connection", socket => {
    allClients[socket.id] = "anonymous"
    updateOnlineUsers();
    socket.emit("get-chatrooms",JSON.stringify(chatrooms));

    socket.on('create-chatroom',(msg,callback) => {
        if(!chatrooms.includes(msg)) {
            chatrooms.push(msg);
            socket.join(msg);
            updateChatrooms();
        }
        else {
            callback("this chatroom already exists");
        }
    })

    socket.on('login-info',(message) => {
        allClients[socket.id] = message
        updateOnlineUsers();
    })

    socket.on('disconnect', () => {
        delete allClients[socket.id]
        updateOnlineUsers();
    })

    socket.on("join-chatroom",(wantedChatroomID) => {
        socket.join(wantedChatroomID);
    })
    socket.on("upload",(msg) => {
        io.to(msg.receiverId).emit("message-receiver",msg);
    })

    socket.on('message-receiver', message => {
        let msg = JSON.parse(message);
        io.to(msg.receiverId).emit("message-receiver",msg);
    })
})

