import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TxRoutingModule } from "./tx-routing.module";

import { TxComponent } from "./tx.component";
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
import { NzTabsModule } from "ng-zorro-antd/tabs";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzInputNumberModule } from "ng-zorro-antd/input-number";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";
import { ClipboardModule } from "ngx-clipboard";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd/message";

@NgModule({
  declarations: [TxComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NzButtonModule,
    NzGridModule,
    NzCardModule,
    NzEmptyModule,
    NzSpinModule,
    NzSliderModule,
    NzBadgeModule,
    NzTabsModule,
    NzInputModule,
    NzFormModule,
    NzSelectModule,
    NzIconModule,
    NzTagModule,
    NzToolTipModule,
    NzInputNumberModule,
    NzStatisticModule,
    ClipboardModule,
    TxRoutingModule,
  ],
  providers: [NzModalService, NzMessageService],
})
export class TxModule {}
