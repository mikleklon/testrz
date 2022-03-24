import * as fs from "fs";
import { Md5 } from 'ts-md5';


export interface IUser {
    id?: number;
    login?: string;
    password?: string;
    token?: string;
    name?: string;
}

export default class users {
    private _fileSrc: string;

    constructor(file: string) {
        this._fileSrc = file;
    }

    private _readUsers(): Promise<IUser[]> {
        return new Promise<IUser[]>((res, rej) => {
            fs.readFile(this._fileSrc, "utf8", (err, data) => {
                if (err)
                    return rej(undefined);
                try {
                    res(JSON.parse(data));
                } catch (e) {
                    rej(undefined);
                }
            });
        });
    }
    private _writeUsers(users: IUser[]): Promise<void> {
        return new Promise<void>((res, rej) => {
            fs.writeFile(this._fileSrc, JSON.stringify(users), err => {
                if (err)
                    rej(undefined);
                res();
            });
        });
    }
    private _getUser(login: string, password: string, token: string): Promise<IUser> {
        let _pasmd5: string = password && Md5.hashStr(password);
        return this._readUsers().then(users => {
            let _user: IUser = undefined;
            users.forEach(user => {
                if ((!!login && user.login == login && user.password == _pasmd5) || (!!token && user.token == token))
                   _user = user;
            });
            //console.log("find user", _user);
            if (_user)
                return _user;
            return Promise.reject(undefined);
        });
    }
    private _updateUser(user: IUser): void {
        this._readUsers().then(users => {
            users.forEach(us => {
                if (us.id == user.id) {
                    us.password = user.password;
                    us.token = user.token;
                    us.name = user.name;
                    this._writeUsers(users);
                }
            });
        });
    }
    private _addUser(user: IUser): Promise<IUser> {
        return this._readUsers().then(users => users, () => []).then(users => {
            let _f = false;
            user.id = 1;
            users.forEach(us => {
                if (user.id <= us.id)
                    user.id = us.id + 1;
                if (us.login == user.login)
                    _f = true;
            });
            if (_f)
                return Promise.reject(undefined);
            users.push(user);
            this._writeUsers(users);
            return user
        });
    }

    public auth(login: string, password: string, token: string, resetToken: boolean = true): Promise<IUser> {
        if (!((!!login && !!password) || token))
            return Promise.reject();
        return this._getUser(login, password, token).then(user => {
            if (resetToken) {
                user.token = Md5.hashStr(new Date().getMilliseconds().toString());
                this._updateUser(user);
            }
            return user;
        });
    }

    public registr(login: string, password: string, name: string): Promise<IUser> {
        console.log("Registr:", login, password, name);
        let user: IUser = {
            id: 0,
            login: login,
            password: Md5.hashStr(password),
            token: undefined,
            name: name
        };
        return this._addUser(user).then(() => this.auth(login, password, undefined));
    }
    public logout(login: string, token: string): Promise<IUser> {
        return this._readUsers().then(users => {
            let _user: IUser = undefined;
            users.forEach(user => {
                if ((!!login && user.login == login) || (!!token && user.token == token)) {
                    user.token = "";
                    this._updateUser(user);
                    _user = user;
                }
            });
            if (_user)
                return _user;

            return Promise.reject(undefined);
        });;
    }
}