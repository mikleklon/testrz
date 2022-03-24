"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("./users"));
const notes_1 = __importDefault(require("./notes"));
let app = express_1.default();
let jsonParser = express_1.default.json();
let users = new users_1.default("./db/users.json");
let notes = new notes_1.default("./db/notes");
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.get("/api/", (req, res) => {
    res.send("Ok");
});
app.post("/api/login", jsonParser, (req, res) => {
    let args = req.body;
    users.auth(args.login, args.password, undefined)
        .then(user => res.send(JSON.stringify({ name: user.name, token: user.token })), () => res.send(JSON.stringify({ token: "" })));
});
app.post("/api/regist", jsonParser, (req, res) => {
    console.log(req);
    let args = req.body;
    users.registr(args.login, args.password, args.name)
        .then(user => res.send(JSON.stringify({ name: user.name, token: user.token })), () => res.send(JSON.stringify({ token: "" })));
});
app.post("/api/logout", jsonParser, (req, res) => {
    let args = req.body;
    users.logout(undefined, args.token).then(() => res.send(""), () => res.send(""));
});
app.post("/api/list", jsonParser, (req, res) => {
    let args = req.body;
    users.auth(undefined, undefined, args?.token, false)
        .catch(() => undefined)
        .then(user => notes.gets(user?.id))
        .then(notes => res.send(JSON.stringify(notes)), () => res.send(JSON.stringify([])));
});
app.post("/api/get", jsonParser, (req, res) => {
    let args = req.body;
    users.auth(undefined, undefined, args.user.token, false)
        .catch(() => undefined)
        .then(user => notes.get(args.note.id, user?.id))
        .then(note => res.send(JSON.stringify(note)), () => res.send(JSON.stringify(undefined)));
});
app.post("/api/edit", jsonParser, (req, res) => {
    let args = req.body;
    users.auth(undefined, undefined, args.user.token, false)
        .then(user => {
        if (args.note.userId === undefined)
            args.note.userId = user.id;
        return notes.get(args.note.id, args.note.userId)
            .then(note => {
            console.log("note edit", note, args.note);
            return notes.edit(args.note);
        }, () => {
            console.log("note add", args.note);
            return notes.add(args.note);
        });
    })
        .then(note => res.send(JSON.stringify(note)), () => res.send(JSON.stringify(undefined)));
});
app.post("/api/remove", jsonParser, (req, res) => {
    let args = req.body;
    users.auth(undefined, undefined, args.user.token, false)
        .then(user => {
        if (args.note.userId === undefined)
            args.note.userId = user.id;
        return notes.get(args.note.id, user?.id)
            .then(note => {
            console.log("note remove", note, args.note);
            return notes.remove(note.id, note.userId);
        });
    })
        .then(() => res.send(JSON.stringify(undefined)), () => res.send(JSON.stringify(undefined)));
});
app.listen(3000, () => { console.log("Waiting..."); });
//# sourceMappingURL=server.js.map