import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { HlmButtonWithLoadingComponent } from 'src/app/shared/ui/hlm-button-with-loading.component';

@Component({
  selector: 'app-user-avatar',
  imports: [HlmButtonWithLoadingComponent],
  host: {
    class: 'flex flex-col items-center',
  },
  template: `
    <img
      [src]="url() ?? '/avatar-placeholder.svg'"
      alt="Avatar"
      class="h-24 w-24 rounded-full object-cover"
    />
    <input
      type="file"
      (change)="fileSelected.emit($event)"
      accept="image/*"
      class="hidden"
      #fileInput
    />
    <div class="flex w-fit flex-col gap-2">
      <button
        hlmBtnWithLoading
        type="button"
        variant="ghost"
        (click)="fileInput.click()"
        [disabled]="isUpdateLoading()"
        [isLoading]="isUpdateLoading()"
      >
        Select Image
      </button>
      <button
        hlmBtnWithLoading
        type="button"
        variant="destructive"
        (click)="remove.emit()"
        [disabled]="!url() || isDeleteLoading()"
        [isLoading]="isDeleteLoading()"
      >
        Delete
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent {
  url = input.required<string | null>();
  isUpdateLoading = input.required<boolean>();
  isDeleteLoading = input.required<boolean>();
  fileSelected = output<Event>();
  remove = output<void>();
}
