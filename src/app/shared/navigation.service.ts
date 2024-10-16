import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  setPage(page: number): void {
    this.setQueryParams({ page });
  }

  setPageSize(pageSize: number): void {
    this.setQueryParams({ pageSize });
  }

  setCustomParam(key: string, value: string | number): void {
    const param = { [key]: value };
    this.setQueryParams(param);
  }

  private setQueryParams = (queryParams: {
    [key: string]: string | number;
  }): void => {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  };
}
