import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useCatalog } from "../hooks/useCatalog";

export default function Categories() {
  const { categories } = useCatalog();
  return <div className="page container"><div className="page-heading"><span className="eyebrow">عالَمكِ الخاص</span><h1>تسوّقي حسب التصنيف</h1><p>كل مجموعة تحمل مزاجًا مختلفًا وتفاصيل منتقاة</p></div><div className="categories-page-grid">{categories.map((category) => <Link key={category._id} to={`/products?category=${category._id}`}><img src={category.image} alt={category.name} /><div><span>{category.productCount} منتجات</span><h2>{category.name}</h2><p>{category.description || "مجموعة مختارة بعناية لتكمّل أناقتكِ"}</p><b>استكشفي المجموعة <ArrowLeft /></b></div></Link>)}</div></div>;
}
