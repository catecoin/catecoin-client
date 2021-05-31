import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TranslateModule } from "@ngx-translate/core";

import { PageNotFoundComponent } from "./components/";
import { WebviewDirective } from "./directives/";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzModalService } from "ng-zorro-antd/modal";
import { NzAlertModule } from "ng-zorro-antd/alert";
import { UserInputDialogComponent } from "./components/";

@NgModule({
  declarations: [
    PageNotFoundComponent,
    UserInputDialogComponent,
    WebviewDirective,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzFormModule,
    NzEmptyModule,
    NzButtonModule,
    NzMenuModule,
    NzAlertModule,
  ],
  exports: [TranslateModule, WebviewDirective, FormsModule],
})
export class SharedModule {}
