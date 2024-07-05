import express from "express";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index"); 
});

const users = {};

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.emit("current-users", users);

    socket.on("send-location", (data) => {
        users[socket.id] = data;
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
        io.emit("user-disconnected", socket.id);
        delete users[socket.id];
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
