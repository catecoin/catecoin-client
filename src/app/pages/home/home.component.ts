import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { RPCService } from "../../core/services";
import { NzModalService } from "ng-zorro-antd/modal";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  closing: boolean = false;
  constructor(
    private router: Router,
    private rpc: RPCService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
  }
}
