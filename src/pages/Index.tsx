import { useState, useEffect } from 'react';
import { getProducts, Product, subscribeToProducts } from '@/utils/storage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');

  useEffect(() => {
    // Загружаем товары при монтировании
    const loadInitialProducts = async () => {
      try {
        const loadedProducts = await getProducts();
        setProducts(loadedProducts);
        setFilteredProducts(loadedProducts);
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
      }
    };

    loadInitialProducts();

    // Подписываемся на изменения товаров в реальном времени
    const unsubscribe = subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
      // Обновляем отфильтрованные товары
      let filtered = updatedProducts;
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }
      if (selectedSize !== 'all') {
        filtered = filtered.filter(p => p.size.includes(selectedSize));
      }
      setFilteredProducts(filtered);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedSize !== 'all') {
      filtered = filtered.filter(p => p.size.includes(selectedSize));
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, selectedSize, products]);

  const handleReset = () => {
    setSelectedCategory('all');
    setSelectedSize('all');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-secondary to-background py-8 sm:py-12 md:py-20">
          <div className="container mx-auto px-3 sm:px-4 text-center">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4 tracking-tight">
              {t('storeName')}
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-2">
              {t('storeSlogan')}
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="container mx-auto px-3 sm:px-4 -mt-4 sm:-mt-6">
          <ProductFilters
            selectedCategory={selectedCategory}
            selectedSize={selectedSize}
            onCategoryChange={setSelectedCategory}
            onSizeChange={setSelectedSize}
            onReset={handleReset}
          />
        </section>

        {/* Products Grid */}
        <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <p className="text-base sm:text-xl text-muted-foreground px-4">
                Товары не найдены. Попробуйте изменить фильтры.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
