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
const fs = __importStar(require("fs"));
const ts_md5_1 = require("ts-md5");
class users {
    constructor(file) {
        this._fileSrc = file;
    }
    _readUsers() {
        return new Promise((res, rej) => {
            fs.readFile(this._fileSrc, "utf8", (err, data) => {
                if (err)
                    return rej(undefined);
                try {
                    res(JSON.parse(data));
                }
                catch (e) {
                    rej(undefined);
                }
            });
        });
    }
    _writeUsers(users) {
        return new Promise((res, rej) => {
            fs.writeFile(this._fileSrc, JSON.stringify(users), err => {
                if (err)
                    rej(undefined);
                res();
            });
        });
    }
    _getUser(login, password, token) {
        let _pasmd5 = password && ts_md5_1.Md5.hashStr(password);
        return this._readUsers().then(users => {
            let _user = undefined;
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
    _updateUser(user) {
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
    _addUser(user) {
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
            return user;
        });
    }
    auth(login, password, token, resetToken = true) {
        if (!((!!login && !!password) || token))
            return Promise.reject();
        return this._getUser(login, password, token).then(user => {
            if (resetToken) {
                user.token = ts_md5_1.Md5.hashStr(new Date().getMilliseconds().toString());
                this._updateUser(user);
            }
            return user;
        });
    }
    registr(login, password, name) {
        console.log("Registr:", login, password, name);
        let user = {
            id: 0,
            login: login,
            password: ts_md5_1.Md5.hashStr(password),
            token: undefined,
            name: name
        };
        return this._addUser(user).then(() => this.auth(login, password, undefined));
    }
    logout(login, token) {
        return this._readUsers().then(users => {
            let _user = undefined;
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
        });
        ;
    }
}
exports.default = users;
//# sourceMappingURL=index.js.map