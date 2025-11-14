import { Product } from '@/utils/storage';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="group bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-smooth">
      {/* Изображение */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3">
          <span
            className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
              product.inStock
                ? 'bg-success text-success-foreground'
                : 'bg-destructive text-destructive-foreground'
            }`}
          >
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current" />
            {product.inStock ? t('inStock') : t('outOfStock')}
          </span>
        </div>
      </div>

      {/* Информация */}
      <div className="p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2">
        <h3 className="font-semibold text-sm sm:text-base md:text-lg group-hover:text-accent transition-smooth line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="capitalize truncate">{product.category}</span>
          <span className="hidden sm:inline">•</span>
          <span className="truncate hidden sm:inline">{product.size.join(', ')}</span>
        </div>

        <p className="text-sm sm:text-lg md:text-xl font-bold">
          {product.price.toLocaleString('ru-RU')} {t('som')}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
