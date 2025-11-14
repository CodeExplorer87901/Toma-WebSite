import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getProducts, 
  addProduct, 
  deleteProduct, 
  isAuthenticated, 
  logout, 
  Product, 
  setStoreStatus, 
  getStoreStatus, 
  clearStoreStatus,
  subscribeToProducts,
  subscribeToStoreStatus,
  initializeProducts
} from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trash2, Plus, LogOut, Upload, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Admin = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M']);
  const [imageFile, setImageFile] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [manualStoreStatus, setManualStoreStatus] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'верх',
    price: '',
    inStock: true
  });

  const availableSizes = ['S', 'M', 'L', 'XL', 'Универсальный'];

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Инициализация Firebase при первом запуске
    initializeProducts().catch(console.error);

    // Загружаем товары асинхронно (это синхронизирует localStorage с Firebase)
    loadProducts();
    
    // Загружаем статус магазина асинхронно
    loadStoreStatus();

    // Подписываемся на изменения товаров в реальном времени
    // Подписка автоматически синхронизирует localStorage с Firebase
    const unsubscribeProducts = subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
    });

    // Подписываемся на изменения статуса магазина в реальном времени
    const unsubscribeStatus = subscribeToStoreStatus((status) => {
      setManualStoreStatus(status);
    });

    // Очистка подписок при размонтировании
    return () => {
      unsubscribeProducts();
      unsubscribeStatus();
    };
  }, [navigate]);

  const loadProducts = async () => {
    try {
      const loadedProducts = await getProducts();
      setProducts(loadedProducts);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      toast.error('Ошибка загрузки товаров');
    }
  };

  const loadStoreStatus = async () => {
    try {
      const status = await getStoreStatus();
      setManualStoreStatus(status);
    } catch (error) {
      console.error('Ошибка загрузки статуса магазина:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой (макс. 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFile(reader.result as string);
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !imageFile || selectedSizes.length === 0) {
      toast.error(t('fillAllFields'));
      return;
    }

    try {
      await addProduct({
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        size: selectedSizes,
        inStock: formData.inStock,
        image: imageFile
      });

      toast.success(t('productAdded'));
      setFormData({
        name: '',
        category: 'верх',
        price: '',
        inStock: true
      });
      setSelectedSizes(['M']);
      setImageFile('');
      setImageFileName('');
      // Товары обновятся автоматически через подписку
    } catch (error) {
      console.error('Ошибка добавления товара:', error);
      toast.error('Ошибка добавления товара');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }
    
    // Сохраняем текущий список для отката в случае ошибки
    const previousProducts = [...products];
    
    // Сразу обновляем локальное состояние (оптимистичное обновление)
    setProducts(prev => prev.filter(p => p.id !== id));
    
    try {
      await deleteProduct(id);
      toast.success(t('productDeleted'));
      // Подписка автоматически обновит список через событие localStorageChange
      // Не нужно вызывать getProducts() - это может вернуть старые данные
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      toast.error('Ошибка удаления товара');
      // Откатываем изменения в случае ошибки
      setProducts(previousProducts);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success(t('loggedOut'));
    navigate('/login');
  };

  const handleStoreStatusChange = async (isOpen: boolean) => {
    try {
      await setStoreStatus(isOpen);
      setManualStoreStatus(isOpen);
      toast.success(`Магазин теперь ${isOpen ? 'открыт' : 'закрыт'}`);
    } catch (error) {
      console.error('Ошибка изменения статуса магазина:', error);
      toast.error('Ошибка изменения статуса магазина');
    }
  };

  const handleAutoStatus = async () => {
    try {
      await clearStoreStatus();
      setManualStoreStatus(null);
      toast.success('Статус переключен на автоматический');
    } catch (error) {
      console.error('Ошибка очистки статуса магазина:', error);
      toast.error('Ошибка очистки статуса магазина');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{t('dashboard')}</h1>
          <Button onClick={handleLogout} variant="outline" size="sm" className="sm:size-default">
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </Button>
        </div>

        {/* Управление статусом магазина */}
        <Card className="mb-4 sm:mb-8">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">{t('storeStatus')}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button
                  variant={manualStoreStatus === true ? 'default' : 'outline'}
                  onClick={() => handleStoreStatusChange(true)}
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  {t('storeOpen')}
                </Button>
                <Button
                  variant={manualStoreStatus === false ? 'default' : 'outline'}
                  onClick={() => handleStoreStatusChange(false)}
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  {t('storeClosed')}
                </Button>
                <Button
                  variant={manualStoreStatus === null ? 'default' : 'outline'}
                  onClick={handleAutoStatus}
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  Авто (9:00-20:00)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Форма добавления товара */}
          <Card className="lg:col-span-1 sticky top-4 h-fit">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('addProduct')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('productName')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('productNamePlaceholder')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{t('category')}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="штаны">{t('pants')}</SelectItem>
                      <SelectItem value="куртки">{t('jackets')}</SelectItem>
                      <SelectItem value="верх">{t('top')}</SelectItem>
                      <SelectItem value="кепки">{t('caps')}</SelectItem>
                      <SelectItem value="шапки">{t('hats')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">{t('price')}</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('selectSizes')}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size}`}
                          checked={selectedSizes.includes(size)}
                          onCheckedChange={() => handleSizeToggle(size)}
                        />
                        <Label
                          htmlFor={`size-${size}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">{t('uploadImage')}</Label>
                  <div className="space-y-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    {imageFile && (
                      <div className="relative">
                        <img
                          src={imageFile}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImageFile('');
                            setImageFileName('');
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="inStock">{t('inStock')}</Label>
                  <Switch
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                  />
                </div>

                <Button type="submit" className="w-full text-sm sm:text-base py-2 sm:py-2.5">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addProduct')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Список товаров */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">{t('allProducts')} ({products.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-secondary rounded-lg border border-border"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {product.category} • {product.size.join(', ')} • {product.price} сом
                        </p>
                        <span
                          className={`inline-block mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-medium ${
                            product.inStock ? 'text-success' : 'text-destructive'
                          }`}
                        >
                          {product.inStock ? `🟢 ${t('inStock')}` : `🔴 ${t('outOfStock')}`}
                        </span>
                      </div>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                        className="h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
