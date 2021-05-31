import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { RPCService } from "../../core/services";
import { NzModalService } from "ng-zorro-antd/modal";
import { Utils } from "../../app.utils";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd/message";
import { UserInputDialogComponent } from "../../shared/components";

@Component({
  selector: "app-tx",
  templateUrl: "./tx.component.html",
  styleUrls: ["./tx.component.scss"],
})
export class TxComponent implements OnInit {
  Utils = Utils;
  sendForm: FormGroup;
  accountInfo = [];
  gasPrice = 0;
  gas = 0;
  submitting = false;
  formatterCate = (value: number) => `${value} CATE`;
  parserCate = (value: string) => value.replace(" CATE", "");

  constructor(
    private rpc: RPCService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (Utils.MainAccount) {
      this.initGasPrice();
      this.initAccounts();
    } else {
      this.rpc.onstarted.subscribe(() => {
        this.initGasPrice();
        this.initAccounts();
      });
    }
  }
  get formValid() {
    for (const i in this.sendForm.controls) {
      this.sendForm.controls[i].markAsDirty();
      this.sendForm.controls[i].updateValueAndValidity();
    }
    return this.sendForm.valid;
  }
  async initForm() {
    this.sendForm = this.fb.group({
      account: [null, [Validators.required]],
      to_address: [null, [Validators.required]],
      amount: [0, [Validators.required]],
      transaction_fee: [0, [Validators.required]],
    });
    
    this.sendForm.valueChanges.subscribe(async (sendInfo) => {
      if (!Utils.IsNullOrEmpty(sendInfo.to_address)) {
        var esGas = await this.rpc.EstimateGas({
          from: sendInfo.account.address,
          to: sendInfo.to_address,
          value: "0x" + Number(sendInfo.amount * 1e18).toString(16),
        });
        this.gas = esGas;
        esGas = parseInt(esGas || 0x0, 16);
        this.sendForm.patchValue(
          {
            transaction_fee: (esGas * this.gasPrice) / 1e18,
          },
          { emitEvent: false }
        );
      }
    });
  }
  async initGasPrice() {
    this.gasPrice = await this.rpc.GetGasPrice();
  }
  async initAccounts() {
    var accounts = await this.rpc.GetAccounts();
    var accountInfo = [];
    for (let accountIndex = 0; accountIndex < accounts.length; accountIndex++) {
      const account = accounts[accountIndex];
      var balance = await this.rpc.GetBalance(account);
      accountInfo.push({ address: account, balance: balance });
    }
    this.accountInfo = accountInfo;
    if (accountInfo.length > 0) {
      this.sendForm.patchValue(
        { account: accountInfo[0], amount: 0 },
        { emitEvent: false }
      );
    }
  }
  async send() {
    if (this.formValid) {
      try {
        this.submitting = true;
        var txInfo = this.sendForm.value;
        var balance = parseInt(txInfo.account.balance, 16);
        var total = (txInfo.amount + txInfo.transaction_fee) * 1e18;
        if (total > balance) {
          this.message.error("Balance is not enough.");
          return;
        }
        var success = await this.requestUnlockAccount(txInfo.account.address);
        if (success) {
          var tx = this.rpc.SendTransaction({
            from: txInfo.account.address,
            to: txInfo.to_address,
            value: "0x" + Number(txInfo.amount * 1e18).toString(16),
            gasPrice: this.gasPrice,
            gas: this.gas,
          });
          if (tx) {
            this.message.success("Send success!");
          }
        }
      } catch {
      } finally {
        this.submitting = false;
      }
    }
  }
  async requestUnlockAccount(address) {
    return new Promise(async (resolve, reject) => {
      try {
        var passwd = await UserInputDialogComponent.dialog(this.modal, {
          inputType: "password",
          nzContent: "This operation needs to unlock the account.",
          nzTitle: "Please input account passphrase：",
          inputName: "PASSPHRASE",
          canCancel: true,
        });
        var unloadResult = await this.rpc.UnlockAccount(address, passwd);
        if (!unloadResult) {
          this.message.error("Passphras is not correct, please reinput.");
          resolve(await this.requestUnlockAccount(address));
        } else {
          resolve(true);
        }
      } catch {
        reject(false);
      }
    });
  }
  copied(event) {
    this.message.success("Copied!");
  }
}
