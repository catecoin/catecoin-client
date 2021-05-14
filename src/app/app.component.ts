import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  ViewEncapsulation,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { NzModalService } from "ng-zorro-antd/modal";
import { AppConfig } from "../environments/environment";
import { RPCService } from "./core/services";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  closing: boolean = false;
  showCloseConfirm: boolean = false;
  _showCloseConfirm: boolean = false;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    public rpc: RPCService,
    private modal: NzModalService
  ) {
    this.translate.setDefaultLang("en");
    console.log("AppConfig", AppConfig);
    this.startNode();
    this.rpc.onclose.subscribe((e) => this.closeConfirm(e));
    window.onbeforeunload = (e) => this.closeConfirm(e);
  }
  closeConfirm(e: any) {
    e.cancel = e.returnValue = true;
    this.showCloseConfirm = true;
    this.changeDetectorRef.detectChanges();
  }
  closeConfirmed() {
    this.showCloseConfirm = false;
    this.closing = true;
    this.rpc.close();
    this.changeDetectorRef.detectChanges();
  }
  closeCanceled() {
    this.showCloseConfirm = false;
    this.changeDetectorRef.detectChanges();
  }
  async startNode() {
    if (!this.rpc.isInitialized) {
      this.rpc.initNode();
    }
    this.rpc.startMainProcess();
  }
  async getNodeInfo() {
    var resp = await this.rpc.rpcCall("admin_nodeInfo");
    this.modal.info({ nzTitle: "NodeInfo", nzContent: resp.name });
  }
  async getPeers() {
    var resp = await this.rpc.rpcCall("admin_peers");
    this.modal.info({ nzTitle: "Peers", nzContent: JSON.stringify(resp) });
  }
}
