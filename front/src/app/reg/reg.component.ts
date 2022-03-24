import { Component } from '@angular/core';
import { IUser, ApiService } from '../service/api.service';

@Component({
  selector: 'app-reg',
  templateUrl: './reg.component.html',
})
export class RegComponent {
  public open: boolean = false;
  public login: string = "";
  public password: string = "";
  public name: string = "";
  constructor(
    private _apiServers: ApiService
  ) {
  }

  public openReg(op: boolean) {
    this.open = op;
  }

  public registr() {
    let user: IUser = {
      login: this.login,
      password: this.password,
      name: this.name
    };
    this._apiServers.regist(user).then(
      () => {
        this.open = false;
        this.login = "";
        this.password = "";
        this.name = "";
      },
      () => alert("Error registr")
    );
  }


}
