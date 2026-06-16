# متجر الشامل

متجر إلكتروني احترافي قابل للتوسع لليمن ودول الخليج، مبني على:

- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- لوحة تحكم متعددة الصلاحيات

## مكان الملفات

- الواجهة: `client`
- الخادم: `server`
- نماذج قاعدة البيانات: `server/src/models`
- واجهات REST API: `server/src/routes`
- ملفات الرفع: `server/uploads`

## التشغيل

1. انسخ ملف البيئة:

```bash
copy server\.env.example server\.env
```

2. شغّل MongoDB محليًا أو ضع رابط MongoDB Atlas في `MONGO_URI`.

3. ثبّت الحزم:

```bash
npm run install:all
```

4. أضف البيانات التجريبية:

```bash
npm run seed
```

5. شغّل الواجهة والخادم:

```bash
npm run dev
```

الواجهة: `http://localhost:5173`  
الخادم: `http://localhost:5000`

## حسابات تجريبية

Super Admin:

- البريد: `owner@alshamel.store`
- كلمة المرور: `Admin123!`

Admin:

- البريد: `admin@alshamel.store`
- كلمة المرور: `Admin123!`

Customer:

- البريد: `customer@example.com`
- كلمة المرور: `Customer123!`

## الميزات المنفذة

- هوية متجر الشامل بالأسود والذهبي والأبيض.
- دعم العربية والإنجليزية مع RTL/LTR وحفظ اللغة.
- اختيار الدولة والعملة.
- منتجات متقدمة: brand, SKU, stock, original/sale price, discount, colors, sizes, weight, video.
- تصنيفات رئيسية وفرعية قابلة للترتيب.
- سلة ومفضلة وصفحة دفع مع كوبونات وشحن.
- طرق دفع: الدفع عند الاستلام، PayPal، جيب، فلوسك، الكريمي.
- إثبات دفع للوسائل المحلية مع حالة مراجعة.
- حالات طلب: new, pending, processing, shipped, delivered, cancelled.
- لوحة تحكم: إحصائيات، منتجات، تصنيفات، طلبات، عملاء، إعلانات، عروض، كوبونات، شحن، دفع، إعدادات، موظفون، سجل نشاط.
- صلاحيات: super_admin, admin, employee, customer.
- Activity Log للعمليات الإدارية.
