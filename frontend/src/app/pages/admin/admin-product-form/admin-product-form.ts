import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CATEGORIES } from '../../../constants/api-constants';
import { Product } from '../../../interfaces/product-interface';
import { ProductService } from '../../../services/product-service';
import { ToastService } from '../../../services/toast-service';
import { Icon } from '../../../components/icon/icon';

@Component({
  selector: 'app-admin-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './admin-product-form.html',
  styleUrl: './admin-product-form.css',
})
export class AdminProductForm {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly categories = CATEGORIES;
  protected readonly productId = signal<string | null>(
    this.route.snapshot.paramMap.get('id')
  );
  protected readonly isEdit = computed(() => this.productId() !== null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly imagePreview = signal<string | null>(null);
  protected readonly imageName = signal<string>('');

  private imageFile: File | null = null;

  protected readonly productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    brand: ['', [Validators.required]],
    category: ['mobiles', [Validators.required]],
    subCategory: [''],
    description: ['', [Validators.maxLength(1000)]],
    price: [0, [Validators.required, Validators.min(1)]],
    oldPrice: [0, [Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    rating: [0, [Validators.min(0), Validators.max(5)]],
    isFeatured: [false],
    specs: this.fb.array<ReturnType<AdminProductForm['createSpec']>>([]),
  });

  protected readonly specs = this.productForm.controls.specs as FormArray;

  protected readonly subCategoryOptions = computed(() => {
    const category = this.categoryValue();
    return CATEGORIES.find((entry) => entry.slug === category)?.subCategories ?? [];
  });

  private readonly categoryValue = signal('mobiles');

  constructor() {
    this.productForm.controls.category.valueChanges.subscribe((value) => {
      this.categoryValue.set(value);
      if (value !== 'accessories') {
        this.productForm.controls.subCategory.setValue('');
      }
    });

    const id = this.productId();
    if (id) this.loadProduct(id);
    else this.addSpec();
  }

  protected createSpec(key = '', value = '') {
    return this.fb.nonNullable.group({
      key: [key, [Validators.required]],
      value: [value, [Validators.required]],
    });
  }

  protected addSpec(): void {
    this.specs.push(this.createSpec());
  }

  protected removeSpec(index: number): void {
    this.specs.removeAt(index);
  }

  protected control(name: string): AbstractControl {
    return this.productForm.get(name)!;
  }

  protected showError(name: string): boolean {
    const control = this.control(name);
    return control.invalid && (control.touched || control.dirty);
  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.error('Please choose an image file');
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('Image must be under 5 MB');
      input.value = '';
      return;
    }

    this.imageFile = file;
    this.imageName.set(file.name);

    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  protected submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toast.error('Please fix the highlighted fields');
      return;
    }

    if (!this.isEdit() && !this.imageFile) {
      this.toast.error('A product image is required');
      return;
    }

    const value = this.productForm.getRawValue();
    const data = new FormData();

    data.append('name', value.name.trim());
    data.append('brand', value.brand.trim());
    data.append('category', value.category);
    data.append('subCategory', value.category === 'accessories' ? value.subCategory : '');
    data.append('description', value.description.trim());
    data.append('price', String(value.price));
    data.append('oldPrice', value.oldPrice > 0 ? String(value.oldPrice) : '');
    data.append('stock', String(value.stock));
    data.append('rating', String(value.rating));
    data.append('isFeatured', String(value.isFeatured));
    data.append(
      'specs',
      JSON.stringify(
        (value.specs as { key: string; value: string }[]).filter(
          (spec) => spec.key && spec.value
        )
      )
    );

    if (this.imageFile) data.append('imageUrl', this.imageFile);

    this.saving.set(true);
    const id = this.productId();

    const request = id
      ? this.productService.update(id, data)
      : this.productService.create(data);

    request.subscribe({
      next: (product) => {
        this.saving.set(false);
        this.toast.success(id ? `"${product.name}" updated` : `"${product.name}" added`);
        this.router.navigate(['/admin/products']);
      },
      error: () => this.saving.set(false),
    });
  }

  private loadProduct(id: string): void {
    this.loading.set(true);

    this.productService.getById(id).subscribe({
      next: (product) => this.patchForm(product),
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/products']);
      },
    });
  }

  private patchForm(product: Product): void {
    this.categoryValue.set(product.category);

    this.productForm.patchValue({
      name: product.name,
      brand: product.brand,
      category: product.category,
      subCategory: product.subCategory ?? '',
      description: product.description ?? '',
      price: product.price,
      oldPrice: product.oldPrice ?? 0,
      stock: product.stock,
      rating: product.rating,
      isFeatured: product.isFeatured,
    });

    this.specs.clear();
    for (const spec of product.specs) {
      this.specs.push(this.createSpec(spec.key, spec.value));
    }
    if (this.specs.length === 0) this.addSpec();

    this.imagePreview.set(this.productService.imageUrl(product.imageUrl));
    this.imageName.set(product.imageUrl);
    this.loading.set(false);
  }
}
