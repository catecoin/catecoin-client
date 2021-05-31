import { Injectable } from "@angular/core";

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from "electron";
import * as remote from "@electron/remote";
import * as childProcess from "child_process";
import * as fs from "fs";
import { Subject } from "rxjs";
import { CloseEvent } from "./closeevent";
import { HttpClient } from "@angular/common/http";
import { Utils } from "../../../app.utils";
import { AppConfig } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RPCService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;
  onclose: Subject<CloseEvent> = new Subject<CloseEvent>();
  onstarted: Subject<null> = new Subject<null>();
  _started = false;
  nodeConf: any = {};

  get isStarted(): boolean {
    return this._started;
  }
  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }
  get ping(): boolean {
    return null;
  }
  openDevTools() {
    if (this.ipcRenderer) {
      this.ipcRenderer.send("open-devtools");
    }
  }
  async initNodeConf() {
    return new Promise((resolve, reject) => {
      if (this.ipcRenderer) {
        this.ipcRenderer.on("NodeConf", (event, args) => {
          this.nodeConf = args[0];
          resolve(null);
        });
        this.ipcRenderer.send("getNodeConf");
      } else {
        reject(null);
      }
    });
  }
  getCpuCount() {
    if (this.ipcRenderer) {
      return this.ipcRenderer.sendSync("getCpuCount");
    }
  }
  //#region Catecoin RPC
  async GetAccounts() {
    var resp = await this.rpcCall("eth_accounts");
    return resp as string[];
  }
  async CreateAccount(passphrase) {
    var resp = await this.rpcCall("personal_newAccount", [passphrase]);
    return resp as string;
  }
  async StartMining(thread = 1) {
    var resp = await this.rpcCall("miner_start", [thread]);
    return true;
  }
  async StopMining() {
    var resp = await this.rpcCall("miner_stop");
    return true;
  }
  async SetMinerEtherbase(account) {
    var resp = await this.rpcCall("miner_setEtherbase", [account]);
    return resp as boolean;
  }
  async GetBalance(account, tag = "latest") {
    var resp = await this.rpcCall("eth_getBalance", [account, tag]);
    return resp as string;
  }
  async GetHashrate() {
    var resp = await this.rpcCall("ethash_getHashrate");
    return resp as number;
  }
  async GetIsMining() {
    var resp = await this.rpcCall("eth_mining");
    return resp as boolean;
  }
  async GetIsSyncing() {
    var resp = await this.rpcCall("eth_syncing");
    return resp;
  }
  async GetBlockNumber() {
    var resp = await this.rpcCall("eth_blockNumber");
    return resp;
  }
  async GetGasPrice() {
    var resp = await this.rpcCall("eth_gasPrice");
    return resp;
  }
  async EstimateGas(txInfo) {
    var resp = await this.rpcCall("eth_estimateGas", [txInfo]);
    return resp;
  }
  async UnlockAccount(address, passphrase) {
    var resp = await this.rpcCall("personal_unlockAccount", [
      address,
      passphrase,
    ]);
    return resp;
  }
  async SendTransaction(txInfo) {
    var resp = await this.rpcCall("eth_sendTransaction", [txInfo]);
    return resp;
  }
  //#endregion
  close() {
    if (this.ipcRenderer) {
      this.ipcRenderer.send("close");
    }
  }
  openUrlBySystemBrowser(url) {
    if (this.ipcRenderer) {
      this.ipcRenderer.send("sys-open", url);
    }
  }
  async TxtDNSLookup(domain: string) {
    return new Promise<string>((resolve, reject) => {
      let reqId = Utils.randomString(10);
      this.ipcRenderer.once("dnslookup-feedback-" + reqId, (event, args) => {
        resolve(args);
      });
      this.ipcRenderer.send("dnslookup", [domain, reqId]);
    });
  }
  async rpcCall(method: string, params: any[] = []) {
    var resp: any = await this.http
      .post("http://127.0.0.1:" + this.nodeConf.RpcPort, {
        jsonrpc: "2.0",
        method,
        params,
        id: 1,
      })
      .toPromise();
    if (resp.result) {
      return resp.result;
    }
  }
  constructor(private http: HttpClient) {
    if (this.isElectron) {
      this.ipcRenderer = window.require("electron").ipcRenderer;
      this.webFrame = window.require("electron").webFrame;
      this.childProcess = window.require("child_process");
      this.fs = window.require("fs");
      this.ipcRenderer.on("shutdown", () => {
        console.log("got shutdown signal.");
        let event = new CloseEvent();
        this.onclose.next(event);
        if (!event.cancel) {
          this.close();
        }
      });
    }
  }
}
