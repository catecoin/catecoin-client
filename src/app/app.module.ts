import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { CoreModule } from "./core/core.module";
import { SharedModule } from "./shared/shared.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";

import { NzMenuModule } from "ng-zorro-antd/menu";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzAffixModule } from "ng-zorro-antd/affix";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { NzBadgeModule } from "ng-zorro-antd/badge";
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzProgressModule } from "ng-zorro-antd/progress";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { NzNotificationModule } from "ng-zorro-antd/notification";
// NG Translate
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { HomeModule } from "./pages/home/home.module";
import { DetailModule } from "./pages/detail/detail.module";

import { AppComponent } from "./app.component";

import { ICONS_AUTO } from "../ant-icons";
import { MinerModule } from "./pages/miner/miner.module";
import { TxModule } from "./pages/tx/tx.module";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    NzAffixModule,
    NzMenuModule,
    NzSpinModule,
    NzModalModule,
    NzNotificationModule,
    NzProgressModule,
    NzBadgeModule,
    NzGridModule,
    NzIconModule.forRoot(ICONS_AUTO),
    HomeModule,
    MinerModule,
    TxModule,
    DetailModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [NzModalService],
  bootstrap: [AppComponent],
})
export class AppModule {}
