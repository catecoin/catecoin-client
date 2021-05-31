import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MinerRoutingModule } from "./miner-routing.module";

import { MinerComponent } from "./miner.component";
import { SharedModule } from "../../shared/shared.module";

import { NzGridModule } from "ng-zorro-antd/grid";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzStatisticModule } from "ng-zorro-antd/statistic";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { NzModalService } from "ng-zorro-antd/modal";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzSliderModule } from "ng-zorro-antd/slider";
import { NzBadgeModule } from "ng-zorro-antd/badge";

@NgModule({
  declarations: [MinerComponent],
  imports: [
    CommonModule,
    SharedModule,
    NzButtonModule,
    NzGridModule,
    NzCardModule,
    NzEmptyModule,
    NzSpinModule,
    NzSliderModule,
    NzBadgeModule,
    NzStatisticModule,
    MinerRoutingModule,
  ],
  providers: [NzModalService],
})
export class MinerModule {}
