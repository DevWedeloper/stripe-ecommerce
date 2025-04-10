import { computed, inject, Injectable } from '@angular/core';
import {
  pendingUntilEvent,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  materialize,
  share,
  shareReplay,
  switchMap,
  take,
} from 'rxjs';
import { getS3ImageUrl } from 'src/app/shared/utils/image-object';
import { environment } from 'src/environments/environment';
import {
  GetReviewsSchema,
  ratingFilterSchema,
  RatingFilterSchema,
  ReviewSortBySchema,
  reviewSortBySchema,
} from 'src/schemas/review';
import { TrpcClient } from 'src/trpc-client';
import { getAvatarPath } from 'src/utils/image';
import {
  errorStream,
  finalizedStatusStream,
  initialLoading,
  successStream,
} from '../../../../../shared/utils/rxjs';
import { parseToPositiveInt } from '../../../../../shared/utils/schema';
import { showError } from '../../../../../shared/utils/toast';
@Injectable()
export class GetReviewsService {
  private route = inject(ActivatedRoute);
  private _trpc = inject(TrpcClient);

  private filterStateSync$ = this.route.queryParams.pipe(
    take(1),
    map((queryParams) => {
      const { sortBy, ratingFilter } = queryParams;

      const sortByValue: ReviewSortBySchema | null = (() => {
        const result = reviewSortBySchema.safeParse(sortBy);
        return result.success ? result.data : null;
      })();

      const ratingFilterValue: RatingFilterSchema | null = (() => {
        const result = ratingFilterSchema.safeParse(Number(ratingFilter));
        return result.success ? result.data : null;
      })();

      return {
        sortBy: sortByValue,
        ratingFilter: ratingFilterValue,
      };
    }),
  );

  private filter$ = combineLatest([
    this.route.params,
    this.route.queryParams,
  ]).pipe(
    map(([params, queryParams]) => {
      const { productId } = params;

      const productIdValue = Number(productId);

      if (isNaN(productIdValue)) {
        throw new Error('Not a valid ID');
      }

      const { page, pageSize, sortBy, ratingFilter } = queryParams;
      const pageValue = parseToPositiveInt(page, 1);
      const pageSizeValue = parseToPositiveInt(pageSize, 10);

      const sortByValue: ReviewSortBySchema = (() => {
        const result = reviewSortBySchema.safeParse(sortBy);
        return result.success ? result.data : 'recent';
      })();

      const ratingFilterValue: RatingFilterSchema | undefined = (() => {
        const result = ratingFilterSchema.safeParse(Number(ratingFilter));
        return result.success ? result.data : undefined;
      })();

      const data: GetReviewsSchema = {
        productId: productIdValue,
        page: pageValue,
        pageSize: pageSizeValue,
        sortBy: sortByValue,
        ratingFilter: ratingFilterValue,
      };

      return data;
    }),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private reviews$ = this.filter$.pipe(
    pendingUntilEvent(),
    switchMap((data) => this._trpc.reviews.getPaginated.query(data)),
    materialize(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private reviewsSuccess$ = this.reviews$.pipe(
    successStream(),
    map((data) => ({
      ...data,
      reviews: data.reviews.map((review) => ({
        ...review,
        avatarPath: review.avatarPath
          ? getS3ImageUrl({
              path: getAvatarPath(review.avatarPath, 'icon'),
              bucketName: environment.avatarsS3Bucket,
            })
          : null,
      })),
    })),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private reviewsError$ = this.reviews$.pipe(errorStream(), share());

  private status$ = finalizedStatusStream({
    success: this.reviewsSuccess$,
    error: this.reviewsError$,
  });

  private initialLoading$ = this.status$.pipe(initialLoading());

  private reviewData = toSignal(this.reviewsSuccess$, {
    initialValue: {
      page: 1,
      pageSize: 10,
      totalPages: 0,
      totalReviews: 0,
      reviews: [],
    },
  });

  filterStateSync = toSignal(this.filterStateSync$, {
    initialValue: {
      sortBy: null,
      ratingFilter: null,
    },
  });

  page = computed(() => this.reviewData().page);
  pageSize = computed(() => this.reviewData().pageSize);
  totalReviews = computed(() => this.reviewData().totalReviews);
  reviews = computed(() => this.reviewData().reviews);

  isInitialLoading = toSignal(this.initialLoading$, { initialValue: true });

  constructor() {
    this.reviewsError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }
}
