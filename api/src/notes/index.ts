import * as fs from "fs";
import * as dateformat from "dateformat";

export enum EType {
    Meeting,
    Business,
    Memo
}

export interface INote {
    id: number;
    userId: number;
    type: EType;
    start: number;
    end?: number;
    name: string;
    place?: string;
}

export default class Notes {

    private _filePath: string;

    constructor(path: string) {
        this._filePath = path;
    }

    private _readNotes(id: number): Promise<INote[]> {
        return new Promise((res, rej) => {
            if (id !== undefined) {
                fs.readFile(this._filePath + "_" + id + ".json", "utf8", (err, data) => {
                    if (err)
                        return rej(err.message);
                    try {
                        res(JSON.parse(data));
                    } catch (e) {
                        rej("JSON no parse");
                    }
                });
            } else {
                this._readNotes(0).then(d => res(d), e => rej(e));
            }

        });
    }
    private _writeNotes(notes: INote[], id: number): Promise<void> {
        return new Promise((res, rej) => {
            if (id !== undefined) {
                fs.writeFile(this._filePath + "_" + id + ".json", JSON.stringify(notes), "utf8", (err) => {
                    if (err)
                        return rej(err.message);
                    res();
                });
            } else {
                this._writeNotes(notes, 0).then(d => res(d), e => rej(e));
            }

        });
    }


    public gets(userId: number, startDate?: number, endDate?: number, isAdd0: boolean = true): Promise<INote[]> {
        let _promise = Promise.resolve<INote[]>([]);
        if (userId > 0)
            _promise = _promise.then(
                d => this._readNotes(userId).then(
                    data => {
                        
                        let notes = data.map(note => (!startDate || note.start >= startDate) && (!endDate || note.end <= endDate) && note) || [];
                        return d.concat(notes);
                    },
                    () => d.concat([])
                )
            );
        if (isAdd0)
            _promise = _promise.then(
                d => this._readNotes(0).then(
                    data => {
                        let notes = data.map(note => (!startDate || note.start >= startDate) && (!endDate || note.end <= endDate) && note) || [];
                        return d.concat(notes);
                    },
                    () => d.concat([])
                )
            );
        //_promise.then(d => console.log(d));
        return _promise;            
    }

    public get(id: number, userId?: number): Promise<INote> {
        return this.gets(userId, undefined, undefined).then(notes => {
            console.log(notes);
            let _note: INote = undefined;
            notes.forEach(note => {
                if ((!userId || note.userId == userId) && note.id == id)
                    _note = note;
            });
            if (!_note)
                return Promise.reject();
            return _note;
        });
    }

    public add(note: INote): Promise<INote> {
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

    public edit(note: INote): Promise<INote> {
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
    public remove(id: number, userId?: number): Promise<void> {
        return this.gets(userId, undefined, undefined, false).then(notes => {
            console.log(userId, id, notes);
            notes.forEach((n,i) => {
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