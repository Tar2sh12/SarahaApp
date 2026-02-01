import { Server } from "socket.io"
// establish socket connection
let io = null;
export const socketConnection = (server) => {
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000", "https://sarahaapp.tech"],
            methods: ["GET", "POST"]
        },
        allowEIO3: true // Support older clients if any
    })
    return io;
}

// return io parameter 
export const getIo = () => {
    return io;
}