import { ApplicationRef, ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { ApiService, entityNote, EType, INote } from '../service/api.service';


@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
})
export class EditComponent implements OnChanges, OnInit {

  public data(): INote {
    return this._apiServers.editNode;
  }



  public get all(): boolean {
    return this.data().userId == 0;
  }
  public set all(v: boolean) {
    let userId = this.data().userId;
    this.data().userId = v ? 0 : userId == 0 ? undefined : userId;
  }
  private static _isOpen?: boolean;
  public noteType = EType;

  constructor(
    private _apiServers: ApiService,
    private changeDetectorRef: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private zone: NgZone
  ) {
  }
    ngOnInit(): void {
      
    }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("ch", changes, this.isOpen())
    
  };

  public enumObj(): { k: number, v: string }[] {
    let res: { k: number, v: string }[] = [];
    Object.keys(EType).forEach(key => {
      if (parseInt(key)?.toString() == key)
        res.push({ k: parseInt(key), v: EType[parseInt(key)] });
    })
    return res;
  }
  public toDate(d?: number): string {
    if (!d)
      return "";
    return new Date(d).toISOString().slice(0, 16);
  }
  public toDateNumber(d: string): number | undefined {
    if (!d)
      return undefined;
    return new Date(d).getTime();
  }
  public toStart(d: Event) {
    this.data().start = this.toDateNumber((<any>d.target).value);
  }
  public toEnd(d: Event) {
    this.data().end = this.toDateNumber((<any>d.target).value);
  }

  public save() {
    console.log("save");
    this.data().userId = this.all ? 0 : undefined;
    this._apiServers.edit(this.data()).then(
      () => {
        this._apiServers.openEditNode = false;
        this._apiServers.editNode = entityNote;
      },
      () => alert("Error save")
    );
  }
  public cancel() {
    console.log("cancel");
    this._apiServers.editNode =entityNote;
    this._apiServers.openEditNode = false;

  }
  public isOpen(): boolean {
    return !!this._apiServers.openEditNode;
  }

}
