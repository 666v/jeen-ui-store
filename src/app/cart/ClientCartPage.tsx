'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth, isUserAuthenticated, getAuthToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { checkoutApi } from '@/lib/store-api';
import { useTranslation } from '@/lib/useTranslation';
import { useLanguage } from '@/components/LanguageProvider';
import { useCurrency } from '@/lib/currency';
import AuthModal from '@/components/auth/AuthModal';

export default function CartPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { selectedCurrency, formatPrice, convertPrice } = useCurrency();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const {
    items,
    count,
    subtotal,
    total,
    discount_amount,
    coupon,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    fetchCart
  } = useCart();

  const { isAuthenticated, customer } = useAuth();
  const router = useRouter();

  const handleUpdateQuantity = async (productId: number, type: '+' | '-') => {
    try {
      // Get current item to calculate new quantity
      const currentItem = Object.values(items).find(item => item.product_id === productId);
      if (!currentItem) return;

      const newQuantity = type === '+' ? currentItem.quantity + 1 : currentItem.quantity - 1;
      await updateQuantity(productId, newQuantity);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeItem(productId);
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      await applyCoupon(couponCode);
      setCouponCode('');
      toast.success('Coupon applied successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      toast.success('Coupon removed successfully');
    } catch (error: any) {
      toast.error('Failed to remove coupon');
    }
  };

  const handleCheckout = async () => {
    // Check authentication using helper functions
    const authToken = getAuthToken();
    const userIsAuthenticated = isUserAuthenticated();

    // More robust authentication check
    if (!authToken || !userIsAuthenticated) {
      toast.error('Please log in to continue with checkout');
      setIsAuthModalOpen(true);
      return;
    }

    setIsCheckingOut(true);
    try {
      // Ensure cart is not empty (matching legacy validation)
      if (count === 0) {
        toast.error('السلة فارغة'); // Arabic message like legacy
        return;
      }

      // Force refresh cart to ensure it's synced
      await fetchCart();

      // Double-check cart count after refresh
      if (count === 0) {
        toast.error(locale === 'ar' ? 'السلة فارغة بعد تحديث البيانات' : 'Cart is empty after refresh');
        return;
      }

      console.log('Creating checkout with cart count:', count, 'items:', Object.keys(items).length);
      const checkoutData = await checkoutApi.create();
      console.log('Checkout response:', checkoutData);


      // Handle different checkout responses (matching legacy behavior)
      if (checkoutData.type === 'free_order') {
        // Free order - redirect to order page like legacy
        toast.success('تم إنشاء الطلب بنجاح!'); // Arabic success message
        router.push(`/order/${checkoutData.order_id}`);
      } else if (checkoutData.type === 'payment_required') {
        // Payment required - redirect to payment page like legacy
        if (checkoutData.redirect_url || checkoutData.checkout_url) {
          window.location.href = checkoutData.redirect_url || checkoutData.checkout_url;
        } else {
          toast.error('خطأ في إنشاء رابط الدفع'); // Arabic error message
        }
      } else {
        // Handle generic response format (fallback)
        if (checkoutData.checkout_url) {
          window.location.href = checkoutData.checkout_url;
        } else {
          toast.success('تم إنشاء الطلب بنجاح!');
          router.push('/account');
        }
      }
    } catch (error: any) {


      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        // Clear Zustand state directly without calling logout API
        useAuth.setState({
          isAuthenticated: false
        });
        toast.error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.'); // Arabic message
        setIsAuthModalOpen(true);
      } else {
        // Show Arabic error messages like legacy system
        const errorMessage = error.response?.data?.message || error.message || 'فشل في إتمام عملية الدفع. يرجى المحاولة مرة أخرى.';
        toast.error(errorMessage);
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (count === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-8">{t('cart')}</h1>
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {locale === 'ar' ? 'السلة فارغة' : 'Your cart is empty'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {locale === 'ar' ? 'ابدأ التسوق لإضافة عناصر إلى سلتك' : 'Start shopping to add items to your cart'}
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-primary/90 backdrop-blur-sm">
                {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-white mb-8">
        {locale === 'ar' ?
          `سلة التسوق (${count} ${count === 1 ? 'عنصر' : 'عناصر'})` :
          `Shopping Cart (${count} ${count === 1 ? 'item' : 'items'})`
        }
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden">
            {Object.values(items).map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center sm:items-stretch p-6 border-b border-zinc-800/40 last:border-b-0 bg-zinc-900/60 hover:shadow-emerald-500/10 transition-all gap-y-4 sm:gap-y-0 gap-x-6">
                {/* Product Image */}
                <div className="flex-shrink-0 w-20 h-20 bg-zinc-800/60 rounded-xl overflow-hidden flex items-center justify-center">
                  {(item.product?.image?.full_link || item.image?.full_link) ? (
                    <img
                      src={item.product?.image?.full_link || item.image?.full_link}
                      alt={item.product?.image?.alt_text || item.image?.alt_text || item.product?.name || item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 text-2xl">
                      📦
                    </div>
                  )}
                </div>
                {/* Product Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-white truncate">{item.name}</h3>
                  <p className="text-sm text-zinc-400 mt-1 truncate">
                    {item.product.type} • ر.س{typeof item.unit_price === 'string' ? parseFloat(item.unit_price).toFixed(2) : item.unit_price?.toFixed(2) || '0.00'} {locale === 'ar' ? 'للقطعة' : 'each'}
                  </p>

                  {/* Custom Fields */}
                  {item.custom_fields && Object.keys(item.custom_fields).length > 0 && (
                    <div className="mt-2">
                      {Object.entries(item.custom_fields).map(([key, value], index) => {
                        // If key is a number (index), try to get field name from product fields
                        const fieldName = isNaN(Number(key)) ? key :
                          (item.product?.fields && item.product.fields[Number(key)]?.name) || `Field ${Number(key) + 1}`;

                        return (
                          <div key={index} className="text-sm text-zinc-400">
                            <span className="font-medium">{fieldName}:{String(value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Legacy Fields Support */}
                  {item.fields && item.fields.length > 0 && (
                    <div className="mt-2">
                      {item.fields.map((field, index) => (
                        <div key={index} className="text-sm text-zinc-400">
                          <span className="font-medium">{field.name}:</span> {field.value}
                          {field.price && <span className="ml-2">(+ر.س{field.price})</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Subscription Plan */}
                  {(item.subscription_plan || item.plan) && (
                    <div className="mt-2 text-sm text-zinc-400">
                                            <span className="font-medium">{locale === 'ar' ? 'الخطة:' : 'Plan:'}</span> {(item.subscription_plan || item.plan)?.duration} {locale === 'ar' ? 'يوم' : 'days'} - {(item.subscription_plan || item.plan)?.formatted_price}
                    </div>
                  )}

                  {/* Notice */}
                  {item.notice && (
                    <div className="mt-2 text-sm text-zinc-400">
                      <span className="font-medium">{locale === 'ar' ? 'ملاحظة:' : 'Note:'}</span> {item.notice}
                    </div>
                  )}
                </div>
                {/* Quantity Controls */}
                <div className="flex items-center gap-x-2 mt-4 sm:mt-0">
                  <button
                    onClick={() => handleUpdateQuantity(Number(item.product_id), '-')}
                    className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800/80 text-white border-2 border-zinc-700 transition-all"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(Number(item.product_id), '+')}
                    className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800/80 text-white border-2 border-zinc-700 transition-all"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveItem(Number(item.product_id))}
                    className="p-2 rounded-xl bg-zinc-900/80 hover:bg-red-500/10 text-red-400 border-2 border-zinc-700 ml-4 transition-all"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                {/* Item Price */}
                <div className="text-lg font-bold text-emerald-400 ml-0 sm:ml-6 mt-4 sm:mt-0 whitespace-nowrap">
                  {formatPrice(item.total_price)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-extrabold text-white mb-6">
              {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
            </h2>

            {/* Coupon */}
            <div className="mb-6">
              {coupon ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-emerald-400">
                      {locale === 'ar' ? 'تم تطبيق الكوبون' : 'Coupon Applied'}
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-sm text-red-400 hover:text-red-500 font-bold transition-colors"
                    >
                      {locale === 'ar' ? 'إزالة' : 'Remove'}
                    </button>
                  </div>
                  <div className="text-sm text-emerald-400">
                    <div className="font-bold">{coupon.code}</div>
                    <div className="flex justify-between mt-1">
                      <span>{locale === 'ar' ? 'نوع الخصم:' : 'Discount Type:'}</span>
                      <span>{coupon.type === 'percent' ? (locale === 'ar' ? 'نسبة مئوية' : 'Percentage') : (locale === 'ar' ? 'مبلغ ثابت' : 'Fixed Amount')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'ar' ? 'قيمة الخصم:' : 'Discount Value:'}</span>
                      <span>{coupon.type === 'percent' ? `${coupon.value}%` : `ر.س${coupon.value}`}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={locale === 'ar' ? 'كوبون الخصم' : 'Coupon Code'}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-2 bg-zinc-800/60 text-white border-2 border-zinc-700 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all"
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  />
                  <Button onClick={handleApplyCoupon} variant="outline" className="rounded-l-lg bg-emerald-500 hover:bg-emerald-600 font-bold px-4 py-3">
                    {locale === 'ar' ? 'تطبيق' : 'Apply'}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-zinc-400">
                <span>{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span>ر.س{subtotal.toFixed(2)}</span>
              </div>
              {discount_amount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>{locale === 'ar' ? 'الخصم' : 'Discount'}</span>
                  <span>-ر.س{discount_amount.toFixed(2)}</span>
                </div>
              )}
              <hr className="border-zinc-800/40" />
              <div className="flex justify-between text-lg font-extrabold text-white">
                <span>{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span>{formatPrice(total)}</span>
              </div>
              {selectedCurrency && !selectedCurrency.is_default && (
                <div className="flex justify-between text-sm text-zinc-400 mt-1">
                  <span>≈</span>
                  <span>{`ر.س${convertPrice(total, selectedCurrency.code).toFixed(2)}`}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl py-3 text-lg"
              size="lg"
              disabled={isCheckingOut}
            >
              {isCheckingOut ?
                (locale === 'ar' ? 'جاري المعالجة...' : 'Processing...') :
                (locale === 'ar' ? 'المتابعة للدفع' : 'Proceed to Checkout')
              }
            </Button>

            {!isAuthenticated && (
              <p className="text-sm text-zinc-400 text-center mt-4">
                {locale === 'ar' ? 'يرجى تسجيل الدخول لإكمال الشراء' : 'Please log in to complete your purchase'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          // Wait a bit for cart to sync after login, then retry checkout
          setTimeout(async () => {
            try {
              const updatedCart = await fetchCart();
              const itemCount = Object.keys(updatedCart?.items || {}).length;
              console.log('Cart after login - count:', itemCount, 'cart data:', updatedCart);
              
              if (itemCount > 0) {
                handleCheckout();
              } else {
                toast.error(locale === 'ar' ? 'السلة فارغة بعد تسجيل الدخول' : 'Cart is empty after login');
              }
            } catch (error) {
              console.error('Error fetching cart after login:', error);
              toast.error(locale === 'ar' ? 'خطأ في تحديث السلة' : 'Error updating cart');
            }
          }, 1000);
        }}
      />
    </div>
  );
}