import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { GetAddressCheckoutService } from 'src/app/shared/data-access/address/get-address-checkout.service';

@Component({
  selector: 'app-load-more-address-checkout',
  imports: [HlmButtonDirective],
  template: `
    @if (canLoadMore()) {
      <button hlmBtn (click)="loadMore()">Load More</button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadMoreAddressCheckoutComponent {
  private getAddressCheckoutService = inject(GetAddressCheckoutService);

  protected canLoadMore = this.getAddressCheckoutService.canLoadMore;

  protected loadMore(): void {
    this.getAddressCheckoutService.nextBatch();
  }
}
