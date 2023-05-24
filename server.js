const io = require("socket.io")(5100,{cors:{origin: "*"}})

const MESSAGETYPE = {
    TEXT : 0,
    FILE : 1 
}

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

    socket.on('message-receiver', message => {
        let msg = JSON.parse(message);
        if(msg.type === MESSAGETYPE.TEXT) {
            io.to(msg.receiverId).emit("message-receiver",message);
        }
    })
})

