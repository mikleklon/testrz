
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';


export enum EType {
  Meeting,
  Business,
  Memo
};


export interface IUser {
  id?: number;
  login?: string;
  password?: string;
  token?: string;
  name?: string;
};

export interface IArgs {
  user: IUser;
  note?: INote;
  date?: {
    start: Date;
    end: Date;
  };
};

export interface INote {
  id?: number;
  userId?: number;
  type?: EType;
  start?: number;
  end?: number;
  name?: string;
  place?: string;
};

export const entityNote: INote = {
  id: undefined,
  start: Date.now(),
  end: undefined,
  name: "",
  place: "",
  type: EType.Meeting,
  userId: 0
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private _src = "//localhost:3000/api/";
  private _user: IUser = {};
  private _token: string = "";
  private _name: string = "";

  public openEditNode: boolean = false;
  public editNode: INote = entityNote;
  constructor(
    private _http: HttpClient
  ) {
  }
  private _send<T>(api: string, data: any): Promise<T> {
    console.log("req", api, data);
    return this._http.post<any>(this._src + api, data, {}).toPromise().then(data => {
      console.log("res", api, data);
      return data;
    });
  }
  public isAuth(): boolean {
    return this._token != "";
  }
  public userName(): string {
    return this.isAuth() ? this._name : "";
  }
  public login(login: string, password: string): Promise<string> {
    let user: IUser = {
      login: login,
      password: password
    };
    return this._send<IUser>("login", user)
      .then(user => {
        this._token = user.token || "";
        this._name = user.name || "";
        return this._name;
      });

  }
  public regist(user: IUser): Promise<string> {
    return this._send<IUser>("regist", user)
      .then(user => {
        this._token = user.token || "";
        return user.name || "";
      });
  }
  public logout(): Promise<void> {
    return this._send<string>("logout", <IUser>{ token: this._token })
      .then(str => {
        this._token = "";
      });
  }
  public list(start?: Date, end?: Date): Promise<INote[]> {
    return this._send<INote[]>("list", <IUser>{ token: this._token });
  }
  public get(id: number): Promise<INote> {
    let note: INote = {};
    return Promise.resolve(note);
  }
  public edit(note: INote): Promise<INote> {
    return this._send<INote>("edit", <IArgs>{ user: { token: this._token }, note: note });

  }
  public remove(note: INote): Promise<INote> {
    return this._send<INote>("remove", <IArgs>{ user: { token: this._token }, note: note });

  }

}



