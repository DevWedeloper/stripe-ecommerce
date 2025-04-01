import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';
import { HlmScrollAreaDirective } from '@spartan-ng/ui-scrollarea-helm';
import { HlmSpinnerComponent } from '@spartan-ng/ui-spinner-helm';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CropperData, CropperResult } from '../../../../../shared/types/cropper';

@Component({
  selector: 'app-cropper-dialog',
  imports: [
    ImageCropperComponent,
    HlmButtonDirective,
    HlmDialogTitleDirective,
    HlmDialogHeaderComponent,
    HlmDialogFooterComponent,
    NgScrollbarModule,
    HlmScrollAreaDirective,
    HlmSpinnerComponent,
  ],
  template: `
    <ng-scrollbar hlm visibility="hover" class="h-[calc(100vh-6rem)] w-96">
      <hlm-dialog-header>
        <h3 hlmDialogTitle>Please crop your image</h3>
      </hlm-dialog-header>

      <div class="mt-2">
        <image-cropper
          [maintainAspectRatio]="true"
          [aspectRatio]="data.width / data.height"
          [resizeToHeight]="data.height"
          [resizeToWidth]="data.width"
          [onlyScaleDown]="true"
          [imageFile]="data.image"
          (imageLoaded)="imageLoaded()"
          (imageCropped)="imageCropped($event)"
        ></image-cropper>
      </div>

      @if (isLoading()) {
        <div class="flex items-center justify-center">
          <hlm-spinner />
        </div>
      }

      <hlm-dialog-footer class="mt-2">
        <button hlmBtn (click)="cancel()">Cancel</button>
        <button hlmBtn (click)="confirm()">Confirm</button>
      </hlm-dialog-footer>
    </ng-scrollbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CropperDialogComponent {
  private _dialogRef = inject(BrnDialogRef);
  private _dialogContext = injectBrnDialogContext<{ data: CropperData }>();

  protected data = this._dialogContext.data;

  private result = signal<CropperResult | undefined>(undefined);
  protected isLoading = signal(true);

  protected imageLoaded() {
    this.isLoading.set(false);
  }

  protected imageCropped(event: ImageCroppedEvent) {
    const { blob, objectUrl } = event;
    if (blob && objectUrl) {
      this.result.set({ blob, imageUrl: objectUrl });
    }
  }

  protected cancel(): void {
    this._dialogRef.close();
  }

  protected confirm(): void {
    this._dialogRef.close(this.result());
  }
}
