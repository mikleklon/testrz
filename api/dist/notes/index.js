"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EType = void 0;
const fs = __importStar(require("fs"));
var EType;
(function (EType) {
    EType[EType["Meeting"] = 0] = "Meeting";
    EType[EType["Business"] = 1] = "Business";
    EType[EType["Memo"] = 2] = "Memo";
})(EType = exports.EType || (exports.EType = {}));
class Notes {
    constructor(path) {
        this._filePath = path;
    }
    _readNotes(id) {
        return new Promise((res, rej) => {
            if (id !== undefined) {
                fs.readFile(this._filePath + "_" + id + ".json", "utf8", (err, data) => {
                    if (err)
                        return rej(err.message);
                    try {
                        res(JSON.parse(data));
                    }
                    catch (e) {
                        rej("JSON no parse");
                    }
                });
            }
            else {
                this._readNotes(0).then(d => res(d), e => rej(e));
            }
        });
    }
    _writeNotes(notes, id) {
        return new Promise((res, rej) => {
            if (id !== undefined) {
                fs.writeFile(this._filePath + "_" + id + ".json", JSON.stringify(notes), "utf8", (err) => {
                    if (err)
                        return rej(err.message);
                    res();
                });
            }
            else {
                this._writeNotes(notes, 0).then(d => res(d), e => rej(e));
            }
        });
    }
    gets(userId, startDate, endDate, isAdd0 = true) {
        let _promise = Promise.resolve([]);
        if (userId > 0)
            _promise = _promise.then(d => this._readNotes(userId).then(data => {
                let notes = data.map(note => (!startDate || note.start >= startDate) && (!endDate || note.end <= endDate) && note) || [];
                return d.concat(notes);
            }, () => d.concat([])));
        if (isAdd0)
            _promise = _promise.then(d => this._readNotes(0).then(data => {
                let notes = data.map(note => (!startDate || note.start >= startDate) && (!endDate || note.end <= endDate) && note) || [];
                return d.concat(notes);
            }, () => d.concat([])));
        //_promise.then(d => console.log(d));
        return _promise;
    }
    get(id, userId) {
        return this.gets(userId, undefined, undefined).then(notes => {
            console.log(notes);
            let _note = undefined;
            notes.forEach(note => {
                if ((!userId || note.userId == userId) && note.id == id)
                    _note = note;
            });
            if (!_note)
                return Promise.reject();
            return _note;
        });
    }
    add(note) {
        return this.gets(note.userId, undefined, undefined, false)
            .catch(() => {
            this._writeNotes([], note.userId);
            return this.gets(note.userId, undefined, undefined, false);
        })
            .then(notes => {
            //console.log(notes);
            note.id = 0;
            notes.forEach(n => {
                if (n.id >= note.id)
                    note.id = n.id + 1;
            });
            notes.push(note);
            this._writeNotes(notes || [], note.userId);
            return note;
        });
    }
    edit(note) {
        return this.gets(note.userId, undefined, undefined, false)
            .catch(() => {
            this._writeNotes([], note.userId);
            return this.gets(note.userId, undefined, undefined, false);
        })
            .then(notes => {
            notes.forEach(n => {
                if ((note.userId == n.userId) && note.id == n.id) {
                    n.name = note.name;
                    n.place = note.place;
                    n.start = note.start;
                    n.end = note.end;
                    n.type = note.type;
                }
            });
            console.log(notes);
            this._writeNotes(notes, note.userId);
            return note;
        });
    }
    remove(id, userId) {
        return this.gets(userId, undefined, undefined, false).then(notes => {
            console.log(userId, id, notes);
            notes.forEach((n, i) => {
                if ((userId == n.userId) && id == n.id)
                    notes.splice(i, 1);
            });
            console.log(notes);
            this._writeNotes(notes || [], userId);
            return;
        });
        ;
    }
}
exports.default = Notes;
//# sourceMappingURL=index.js.map