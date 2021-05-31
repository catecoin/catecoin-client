import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzModalService } from "ng-zorro-antd/modal";

export class UserInputDialogConfig {
  nzTitle: string | TemplateRef<{}>;
  nzContent: string | TemplateRef<{}> = "";
  inputType: "text" | "password" | "number";
  inputName: string;
  canCancel: boolean = true;
}

@Component({
  selector: "app-user-input-dialog",
  templateUrl: "./user-input-dialog.component.html",
  styleUrls: ["./user-input-dialog.component.scss"],
})
export class UserInputDialogComponent implements OnInit {
  inputType = "text";
  inputName = "PASSWORD";
  content = null;
  validateForm: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      content: [null, [Validators.required]],
    });
  }

  get formValid() {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    return this.validateForm.valid;
  }
  public static async dialog(
    modal: NzModalService,
    conf: UserInputDialogConfig
  ) {
    return new Promise((resolve, reject) => {
      modal.create({
        nzTitle: conf.nzTitle,
        nzContent: UserInputDialogComponent,
        nzClosable: conf.canCancel,
        nzMaskClosable: conf.canCancel,
        nzCancelDisabled: !conf.canCancel,
        nzComponentParams: {
          inputType: conf.inputType,
          inputName: conf.inputName,
          content: conf.nzContent
        },
        nzOnOk: (comp) => {
          if (comp.formValid) {
            resolve(comp.validateForm.value.content);
          } else {
            return false;
          }
        },
        nzOnCancel: () => {
          reject(null);
        },
      });
    });
  }
}
