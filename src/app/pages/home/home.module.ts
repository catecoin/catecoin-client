import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HomeRoutingModule } from "./home-routing.module";

import { HomeComponent } from "./home.component";
import { SharedModule } from "../../shared/shared.module";

import { NzGridModule } from "ng-zorro-antd/grid";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzStatisticModule } from "ng-zorro-antd/statistic";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { NzModalService } from "ng-zorro-antd/modal";

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    SharedModule,
    NzGridModule,
    NzCardModule,
    NzEmptyModule,
    NzSpinModule,
    NzStatisticModule,
    HomeRoutingModule,
  ],
  providers: [NzModalService],
})
export class HomeModule {}
