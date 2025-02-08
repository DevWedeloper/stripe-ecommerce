import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmScrollAreaDirective } from '@spartan-ng/ui-scrollarea-helm';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AddressListCheckoutComponent } from './address-list-checkout.component';
import { CreateAddressCheckoutComponent } from './create-address-checkout.component';
import { EditAddressCheckoutComponent } from './edit-address-checkout.component';
import { LoadMoreAddressCheckoutComponent } from './load-more-address-checkout.component';

@Component({
  selector: 'app-change-address',
  imports: [
    NgClass,
    AddressListCheckoutComponent,
    LoadMoreAddressCheckoutComponent,
    EditAddressCheckoutComponent,
    CreateAddressCheckoutComponent,
    HlmButtonDirective,
    NgIcon,
    HlmIconDirective,
    NgScrollbarModule,
    HlmScrollAreaDirective,
  ],
  providers: [provideIcons({ lucidePlus })],
  template: `
    <ng-scrollbar hlm visibility="hover" class="h-[calc(100vh-6rem)] w-96">
      @switch (currentStep()) {
        @case ('list') {
          <div [ngClass]="{ 'animate-slide-in-from-left': animationTrigger() }">
            <div class="flex flex-col items-center gap-4">
              <app-address-list-checkout
                class="mb-4 block w-full"
                (editChange)="goToEdit()"
              />
              <app-load-more-address-checkout />
            </div>
            <button hlmBtn (click)="goToCreate()">
              <ng-icon hlm size="sm" class="mr-2" name="lucidePlus" />
              Add New Address
            </button>
          </div>
        }
        @case ('edit') {
          <app-edit-address-checkout
            class="block animate-slide-in-from-right"
            (cancelChange)="goToList()"
          />
        }
        @case ('create') {
          <app-create-address-checkout
            class="block animate-slide-in-from-right"
            (cancelChange)="goToList()"
          />
        }
      }
    </ng-scrollbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeAddressComponent {
  protected currentStep = signal<'list' | 'edit' | 'create'>('list');
  protected animationTrigger = signal(false);

  protected goToList(): void {
    this.currentStep.set('list');
  }

  protected goToEdit(): void {
    this.currentStep.set('edit');
    this.animationTrigger.set(true);
  }

  protected goToCreate(): void {
    this.currentStep.set('create');
    this.animationTrigger.set(true);
  }
}
