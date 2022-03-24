import { Component, OnInit } from '@angular/core';
import { IUser, ApiService } from '../service/api.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  public login: string="";
  public password: string="";

  constructor(
    private _apiServers: ApiService
  ) {
  }

  ngOnInit() {
  }

  public isAuth(): boolean {
    return this._apiServers.isAuth();
  }
  public userName() {
    return this._apiServers.userName();
  }
  public logIn() {
    this._apiServers.login(this.login, this.password).then(() => {
      this.login = "";
      this.password = "";
    });
  }
  public logOut() {
    this._apiServers.logout();
  }
  
}
