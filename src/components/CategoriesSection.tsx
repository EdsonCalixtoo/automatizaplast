import productBumper from "@/assets/product-bumper1.jpg";
import productEstribo from "@/assets/product-estribo.jpg";
import productPorta from "@/assets/product-porta.jpg";
import productCapo from "@/assets/product-capo.jpg";
import productGrade from "@/assets/product-grade.jpg";
import productFarol from "@/assets/product-farol.jpg";

const categories = [
  { name: "Parachoques", image: productBumper, id: "parachoques" },
  { name: "Estribos", image: productEstribo, id: "estribos" },
  { name: "Portas", image: productPorta, id: "portas" },
  { name: "Capôs", image: productCapo, id: "capos" },
  { name: "Grades", image: productGrade, id: "grades" },
  { name: "Faróis", image: productFarol, id: "farois" },
];

const CategoriesSection = () => (
  <section className="py-16 bg-muted/50" id="produtos">
    <div className="container">
      <h2 className="section-title text-center mb-4">
        Nossas <span className="text-primary">Categorias</span>
      </h2>
      <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
        Encontre a peça ideal para o seu caminhão com qualidade e preço justo.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {categories.map((cat) => (
          <a key={cat.id} href={`#${cat.id}`} className="category-card group">
            <img
              src={cat.image}
              alt={cat.name}
              loading="lazy"
              width={600}
              height={600}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(216,60%,10%/0.8)] via-[hsl(216,60%,10%/0.2)] to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <h3 className="font-heading text-xl md:text-2xl font-bold uppercase tracking-wider text-white">
                {cat.name}
              </h3>
              <div className="h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full mt-2 rounded-full" />
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default CategoriesSection;
