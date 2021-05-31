import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { RPCService } from "../../core/services";
import { NzModalService } from "ng-zorro-antd/modal";
import { Utils } from "../../app.utils";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  Utils = Utils;
  closing: boolean = false;
  balance: number = 0;
  destroyed = false;
  constructor(
    private router: Router,
    private rpc: RPCService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.destroyed = true;
  }

  async amountReload() {
    try {
      var b16balance = await this.rpc.GetBalance(Utils.MainAccount);
      this.balance = Utils.GetReadableBalance(b16balance);
      this.cdr.detectChanges();
    } catch {}
    if (!this.destroyed) setTimeout(() => this.amountReload(), 1000);
  }
  ngOnInit(): void {
    if (Utils.MainAccount) {
      this.amountReload();
    } else {
      this.rpc.onstarted.subscribe(() => {
        this.amountReload();
      });
    }
  }
}
