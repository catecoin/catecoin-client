import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HomeRoutingModule } from "./home-routing.module";

import { HomeComponent } from "./home.component";
import { SharedModule } from "../../shared/shared.module";

import { NzGridModule } from "ng-zorro-antd/grid";

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, SharedModule, NzGridModule, HomeRoutingModule],
})
export class HomeModule {}
