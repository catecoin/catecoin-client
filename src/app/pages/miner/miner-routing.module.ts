import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MinerComponent } from "./miner.component";

const routes: Routes = [
  {
    path: "miner",
    component: MinerComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MinerRoutingModule {}
