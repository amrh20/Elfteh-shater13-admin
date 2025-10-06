# Pagination Component

مكون مشترك للـ pagination يمكن استخدامه في جميع صفحات التطبيق.

## الميزات

- ✅ **مكون مشترك**: يمكن استخدامه في أي صفحة
- ✅ **مرن**: يدعم تخصيص النص والعدد الأقصى للصفحات المرئية
- ✅ **متجاوب**: يعمل على جميع أحجام الشاشات
- ✅ **سهل الاستخدام**: يحتاج فقط لـ pagination data و event handler
- ✅ **أزرار إضافية**: أول/آخر صفحة، سابق/تالي
- ✅ **معلومات الصفحة**: يعرض معلومات عن العناصر المعروضة

## كيفية الاستخدام

### 1. استيراد المكون

```typescript
import { PaginationComponent, PaginationInfo } from '../../shared/pagination/pagination.component';

@Component({
  // ...
  imports: [CommonModule, PaginationComponent],
  // ...
})
```

### 2. إضافة البيانات

```typescript
export class MyComponent {
  pagination: PaginationInfo | null = null;
  
  loadData(page: number = 1): void {
    this.myService.getData(page, 20).subscribe({
      next: (response: any) => {
        this.data = response.data;
        this.pagination = response.pagination;
      }
    });
  }
}
```

### 3. إضافة Event Handler

```typescript
onPageChange(page: number): void {
  this.loadData(page);
}
```

### 4. استخدام المكون في الـ Template

```html
<app-pagination
  [pagination]="pagination"
  [infoText]="'منتج'"
  [maxVisiblePages]="5"
  (pageChange)="onPageChange($event)"
></app-pagination>
```

## الخصائص (Inputs)

| الخاصية | النوع | الوصف | القيمة الافتراضية |
|---------|-------|--------|-------------------|
| `pagination` | `PaginationInfo \| null` | بيانات الـ pagination | `null` |
| `showInfo` | `boolean` | إظهار معلومات الصفحة | `true` |
| `infoText` | `string` | نص العنصر (مثل: منتج، صنف) | `'عنصر'` |
| `maxVisiblePages` | `number` | أقصى عدد للصفحات المرئية | `5` |

## الأحداث (Outputs)

| الحدث | النوع | الوصف |
|-------|-------|--------|
| `pageChange` | `EventEmitter<number>` | يتم إطلاقه عند تغيير الصفحة |

## واجهة PaginationInfo

```typescript
interface PaginationInfo {
  current: number;    // الصفحة الحالية
  pages: number;      // إجمالي عدد الصفحات
  total: number;      // إجمالي عدد العناصر
  limit: number;      // عدد العناصر في كل صفحة
}
```

## أمثلة على الاستخدام

### في صفحة المنتجات

```html
<app-pagination
  [pagination]="pagination"
  [infoText]="'منتج'"
  [maxVisiblePages]="7"
  (pageChange)="onPageChange($event)"
></app-pagination>
```

### في صفحة الأصناف

```html
<app-pagination
  [pagination]="pagination"
  [infoText]="'صنف'"
  [maxVisiblePages]="3"
  (pageChange)="onPageChange($event)"
></app-pagination>
```

### في صفحة المستخدمين

```html
<app-pagination
  [pagination]="pagination"
  [infoText]="'مستخدم'"
  [maxVisiblePages]="10"
  (pageChange)="onPageChange($event)"
></app-pagination>
```

## التخصيص

يمكن تخصيص المظهر باستخدام CSS:

```scss
// تخصيص أزرار الصفحة
app-pagination button {
  border-radius: 8px;
  font-weight: 600;
}

// تخصيص الصفحة النشطة
app-pagination button[class*="bg-blue-600"] {
  background-color: #059669;
}
```

## ملاحظات مهمة

1. **تأكد من أن `pagination` يحتوي على بيانات صحيحة**
2. **استخدم `onPageChange` لتحميل البيانات الجديدة**
3. **يمكن إخفاء معلومات الصفحة باستخدام `[showInfo]="false"`
4. **المكون يتعامل تلقائياً مع الحالات الخاصة (صفحة واحدة، لا توجد بيانات)**
