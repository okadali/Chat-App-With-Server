const io = require("socket.io")(5000,{cors:{origin: "*"}})

var allClients = {};

io.on("connection", socket => {
    allClients[socket.id] = "anonymous"
    console.log(socket.id);

    socket.on('login-info',(message) => {
        allClients[socket.id] = message
    })

    socket.on('disconnect', () => {
        delete allClients[socket.id]
    })

    socket.on('send-chat-message', message => {
        socket.broadcast.emit("listen-broadcast",message.id);
    })
})

