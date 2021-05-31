import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PageNotFoundComponent } from "./shared/components";

import { HomeRoutingModule } from "./pages/home/home-routing.module";
import { MinerRoutingModule } from "./pages/miner/miner-routing.module";
import { DetailRoutingModule } from "./pages/detail/detail-routing.module";
import { TxRoutingModule } from "./pages/tx/tx-routing.module";

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "**",
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" }),
    HomeRoutingModule,
    MinerRoutingModule,
    TxRoutingModule,
    DetailRoutingModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
