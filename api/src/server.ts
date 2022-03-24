import express from "express"
import { IUser } from "./users";
import Users from "./users";
import Notes, { INote } from "./notes";

let app = express();
let jsonParser = express.json();

let users = new Users("./db/users.json");
let notes = new Notes("./db/notes");

interface IArgs {
    user: IUser;
    note?: INote;
    date?: {
        start: Date;
        end: Date;
    };
}
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
    let args: IUser = req.body;
    users.auth(args.login, args.password, undefined)
        .then(
            user => res.send(JSON.stringify(<IUser>{ name: user.name, token: user.token })),
            () => res.send(JSON.stringify({ token: "" }))
        );
});
app.post("/api/regist", jsonParser, (req, res) => {
    console.log(req);
    let args: IUser = req.body;

    users.registr(args.login, args.password, args.name)
        .then(
            user => res.send(JSON.stringify({ name: user.name, token: user.token })),
            () => res.send(JSON.stringify({ token: "" }))
        )
});
app.post("/api/logout", jsonParser, (req, res) => {
    let args: IUser = req.body;
    users.logout(undefined, args.token).then(
        () => res.send(""),
        () => res.send("")
    );
});
app.post("/api/list", jsonParser, (req, res) => {
    let args: IUser = req.body;
    users.auth(undefined, undefined, args?.token, false)
        .catch<IUser>(() => undefined)
        .then(user => notes.gets(user?.id))
        .then(
            notes => res.send(JSON.stringify(notes)),
            () => res.send(JSON.stringify([]))
        );
});
app.post("/api/get", jsonParser, (req, res) => {
    let args: IArgs = req.body;
    users.auth(undefined, undefined, args.user.token, false)
        .catch<IUser>(() => undefined)
        .then(user => notes.get(args.note.id, user?.id))
        .then(
            note => res.send(JSON.stringify(note)),
            () => res.send(JSON.stringify(undefined))
        );

});
app.post("/api/edit", jsonParser, (req, res) => {
    let args: IArgs = req.body;
    users.auth(undefined, undefined, args.user.token, false)
        .then(user => {
            if (args.note.userId === undefined)
                args.note.userId = user.id;
            return notes.get(args.note.id, args.note.userId)
                .then(
                    note => {
                        console.log("note edit", note, args.note);
                        return notes.edit(args.note);
                    },
                    () => {
                        console.log("note add", args.note);
                        return notes.add(args.note);
                    }
                )
        })
        
        .then(
            note => res.send(JSON.stringify(note)),
            () => res.send(JSON.stringify(undefined))
        );
});
app.post("/api/remove", jsonParser, (req, res) => {
    let args: IArgs = req.body;
    users.auth(undefined, undefined, args.user.token, false)
        .then(user => {
            if (args.note.userId === undefined)
                args.note.userId = user.id;
            return notes.get(args.note.id, user?.id)
                .then(
                    note => {
                        console.log("note remove", note, args.note);
                        return notes.remove(note.id, note.userId);
                    }
                )
        })
        .then(
            () => res.send(JSON.stringify(undefined)),
            () => res.send(JSON.stringify(undefined))
        );
});



app.listen(3000, () => { console.log("Waiting...")})