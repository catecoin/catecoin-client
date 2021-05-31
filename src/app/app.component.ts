import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { NzBadgeStatusType } from "ng-zorro-antd/badge/types";
import { NzModalService } from "ng-zorro-antd/modal";
import { NzNotificationService } from "ng-zorro-antd/notification";
import { AppConfig } from "../environments/environment";
import { Utils } from "./app.utils";
import { RPCService } from "./core/services";
import { UserInputDialogComponent } from "./shared/components/";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  Utils = Utils;
  AppConfig = AppConfig;
  closing: boolean = false;
  showCloseConfirm: boolean = false;
  globalStatus = "Loading...";
  globalStatusType: NzBadgeStatusType = "default";
  _highestBlock = 0;
  _blockNumber = 0;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    public rpc: RPCService,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {
    this.translate.setDefaultLang("en");
    console.log("AppConfig", AppConfig);
    this.rpc.onclose.subscribe((e) => this.closeConfirm(e));
  }
  ngOnInit(): void {
    this.init();
  }
  closeConfirm(e: any) {
    console.log(e);
    e.cancel = true; //rpc.onclose
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
  async init() {
    this.updateStatus("processing", "Init node config...");
    await this.rpc.initNodeConf();
    var accounts = await this.rpc.GetAccounts();
    if (accounts.length <= 0) {
      this.updateStatus("processing", "Create Catecoin account...");
      this.notification.info(
        "Info",
        "Account needs to be created for initial startup."
      );
      var passwd = await this.requestAccountPassphrase();
      Utils.MainAccount = await this.rpc.CreateAccount(passwd);
      this.updateStatus("success", "Catecoin account created...");
    } else {
      Utils.MainAccount = accounts[0];
    }
    await this.rpc.SetMinerEtherbase(Utils.MainAccount);
    Utils.Status = "Running";
    this.statusReload();
    this.rpc.onstarted.next();
    this.updateStatus("success", "Catecoin running.");
  }
  async statusReload() {
    try {
      var isMining = await this.rpc.GetIsMining();
      var isSyncing = await this.isSyncing();
      if (isMining) {
        Utils.Status = "Mining";
        this.updateStatus("processing", "Mining...");
        Utils.Hashrate = await this.rpc.GetHashrate();
      } else if (isSyncing) {
        Utils.Status = "Syncing";
        this.updateStatus("warning", "Syncing blocks.");
      } else {
        Utils.Status = "Running";
        this.updateStatus("success", "Catecoin running.");
      }
      if (!isMining) {
        Utils.Hashrate = 0;
      }
    } catch {}
    setTimeout(() => this.statusReload(), 1000);
  }
  async isSyncing() {
    var isSyncing = await this.rpc.GetIsSyncing();
    if (isSyncing) {
      var blockNumber = await this.rpc.GetBlockNumber();
      this._highestBlock = parseInt(isSyncing.highestBlock, 16);
      this._blockNumber = parseInt(blockNumber, 16);
      if (this._highestBlock == this._blockNumber) {
        return false;
      } else if (this._blockNumber < this._highestBlock) {
        return true;
      } else if (this._blockNumber > this._highestBlock) {
        return true;
      }
      console.log(this._blockNumber, this._highestBlock);
    } else {
      return false;
    }
  }
  async reload() {
    location.reload();
  }
  async getNodeInfo() {
    var resp = await this.rpc.rpcCall("admin_nodeInfo");
    this.modal.info({ nzTitle: "NodeInfo", nzContent: resp.name });
  }
  async getPeers() {
    var resp = await this.rpc.rpcCall("admin_peers");
    this.modal.info({ nzTitle: "Peers", nzContent: JSON.stringify(resp) });
  }
  async requestAccountPassphrase() {
    return new Promise(async (resolve, reject) => {
      try {
        var passwd = await UserInputDialogComponent.dialog(this.modal, {
          inputType: "password",
          nzTitle: "Please input account passphrase：",
          nzContent: "",
          inputName: "PASSPHRASE",
          canCancel: false,
        });
        var re_passwd = await UserInputDialogComponent.dialog(this.modal, {
          inputType: "password",
          nzTitle: "Please reinput account passphrase：",
          nzContent: "",
          inputName: "PASSPHRASE",
          canCancel: false,
        });
      } catch {
        this.notification.error(
          "Error",
          "You need to set a passphrase to create an account."
        );
        resolve(await this.requestAccountPassphrase());
      }
      if (passwd === re_passwd) {
        resolve(passwd);
      } else {
        this.notification.error(
          "Error",
          "Two time password not match, please reinput."
        );
        resolve(await this.requestAccountPassphrase());
      }
    });
  }
  updateStatus(status: NzBadgeStatusType, content: string) {
    this.globalStatusType = status;
    this.globalStatus = content;
    this.changeDetectorRef.detectChanges();
  }
}
