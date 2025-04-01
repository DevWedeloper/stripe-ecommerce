import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/ui-card-helm';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { filter, take } from 'rxjs';
import { DeleteAvatarService } from 'src/app/shared/data-access/avatar/delete-avatar.service';
import { GetAvatarService } from 'src/app/shared/data-access/avatar/get-avatar.service';
import { UploadAvatarService } from 'src/app/shared/data-access/avatar/upload-avatar.service';
import {
  CropperData,
  CropperResult,
} from '../../../../../shared/types/cropper';
import { UserAvatarComponent } from '../ui/user-avatar.component';
import { CropperDialogComponent } from './cropper-dialog.component';

@Component({
  selector: 'app-update-avatar',
  imports: [UserAvatarComponent, ...HlmCardImports],
  template: `
    <div hlmCard>
      <div hlmCardHeader>
        <h3 hlmCardTitle>Update your avatar</h3>
        <p hlmCardDescription>
          Give your profile a fresh new look by updating your avatar!
        </p>
      </div>

      <div hlmCardContent>
        <app-user-avatar
          [url]="url()"
          [isUpdateLoading]="isUpdateLoading()"
          [isDeleteLoading]="isDeleteLoading()"
          (fileSelected)="updateAvatar($event)"
          (remove)="deleteAvatar()"
        />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateAvatarComponent {
  private _hlmDialogService = inject(HlmDialogService);
  private getAvatarService = inject(GetAvatarService);
  private updateAvatarService = inject(UploadAvatarService);
  private deleteAvatarService = inject(DeleteAvatarService);

  protected url = this.getAvatarService.avatarPath;

  protected isUpdateLoading = this.updateAvatarService.isLoading;
  protected isDeleteLoading = this.deleteAvatarService.isLoading;

  protected updateAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    const file = input.files[0];

    input.value = '';

    const dialogRef = this._hlmDialogService.open(CropperDialogComponent, {
      contentClass: 'flex',
      context: {
        data: {
          image: file,
          width: 250,
          height: 250,
        } as CropperData,
      },
    });

    dialogRef.closed$
      .pipe(take(1), filter(Boolean))
      .subscribe((result: CropperResult) =>
        this.updateAvatarService.updateAvatar(result),
      );
  }

  protected deleteAvatar(): void {
    this.deleteAvatarService.deleteAvatar();
  }
}
