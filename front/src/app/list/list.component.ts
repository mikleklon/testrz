import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApiService, entityNote, EType, INote } from '../service/api.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
})
export class ListComponent {
  public notes: INote[] = [];
  constructor(
    private _apiServers: ApiService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    setInterval(()=>this.getNotes(), 2000);
  }


  public createNote() {
    this._apiServers.openEditNode = true;
  }

  public isAuth(): boolean {
    return this._apiServers.isAuth();
  }
  public getNotes(): void {
    this._apiServers.list().then(notes => this.notes = notes);
  }
  public toDate(d?: number): string {
    if (!d)
      return "";
    return new Date(d).toISOString().slice(0, 16);
  }
  public toType(type: EType | undefined): string {
    return type !== undefined ? EType[type] : "";
  }
  public edit(note: INote) {
    if (!note)
      return;
    this._apiServers.editNode = note;
    this._apiServers.openEditNode = true;
  }
  public delete(note: INote) {
    this._apiServers.remove(note).then(() => this.getNotes());
  }
}
