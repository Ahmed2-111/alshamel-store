import { CheckCircle2, PackageSearch } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function OrderSuccess() {
  const { id } = useParams();
  return <div className="page container success-page"><CheckCircle2 /><span className="eyebrow">شكرًا لكِ</span><h1>تم استلام طلبكِ بنجاح</h1><p>بدأنا بتجهيز قطعكِ بعناية. رقم الطلب:</p><code>#{id?.slice(-8).toUpperCase()}</code><div><Link className="button primary" to="/account"><PackageSearch /> تتبّع الطلب</Link><Link className="button outline" to="/products">العودة للمتجر</Link></div></div>;
}
