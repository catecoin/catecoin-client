import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { RPCService } from "../../core/services";
import { NzModalService } from "ng-zorro-antd/modal";
import { Utils } from "../../app.utils";

@Component({
  selector: "app-miner",
  templateUrl: "./miner.component.html",
  styleUrls: ["./miner.component.scss"],
})
export class MinerComponent implements OnInit {
  Utils = Utils;
  useThread = 1;
  maxThread = 1;
  constructor(private rpc: RPCService) {}

  async startMiner() {
    await this.rpc.StartMining(this.useThread);
  }
  async stopMiner() {
    await this.rpc.StopMining();
  }
  async loadCpuCount() {
    this.maxThread = this.rpc.getCpuCount();
  }
  get canMining(): boolean {
    return Utils.Status === "Running";
  }
  get IsMining(): boolean {
    return Utils.Status === "Mining";
  }
  get Hashrate() {
    var hashrate = Utils.Hashrate || 0;
    if (hashrate > 1e10) {
      return (hashrate / 1e10).toFixed(2) + " GH/s";
    } else if (hashrate > 1e7) {
      return (hashrate / 1e7).toFixed(2) + " MH/s";
    } else if (hashrate > 1e3) {
      return (hashrate / 1e3).toFixed(2) + " kH/s";
    } else {
      return hashrate.toFixed(0) + " H/s";
    }
  }
  ngOnInit(): void {
    this.loadCpuCount();
  }
}
