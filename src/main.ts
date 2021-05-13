import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { AppConfig } from "./environments/environment";

if (AppConfig.production) {
  enableProdMode();
}
window.onload = function () {
  const preloader = document.getElementsByClassName("preloader");
  if (preloader.length > 0) {
    preloader[0].remove();
  }
};
platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    preserveWhitespaces: false,
  })
  .catch((err) => console.error(err));
