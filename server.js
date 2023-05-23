const io = require("socket.io")(5000,{cors:{origin: "*"}})

var allClients = {};

const updateOnlineUsers = () => {
    io.emit("get-users",JSON.stringify(allClients));
}

io.on("connection", socket => {
    allClients[socket.id] = "anonymous"
    updateOnlineUsers();

    socket.on('login-info',(message) => {
        allClients[socket.id] = message
        updateOnlineUsers();
    })

    socket.on('disconnect', () => {
        delete allClients[socket.id]
        updateOnlineUsers();
    })

    socket.on('send-chat-message', message => {
        socket.broadcast.emit("listen-broadcast",message.id);
    })
})

