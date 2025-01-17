import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { GetAddressService } from '../data-access/get-address.service';

@Component({
  selector: 'app-load-more-address',
  imports: [HlmButtonDirective],
  template: `
    @if (canLoadMore()) {
      <button hlmBtn (click)="loadMore()">Load More</button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadMoreAddressComponent {
  private getAddressService = inject(GetAddressService);

  protected canLoadMore = this.getAddressService.canLoadMore;

  protected loadMore(): void {
    this.getAddressService.nextBatch();
  }
}
