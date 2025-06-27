'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { sdk } from '@/lib/sdk';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBagIcon, EyeIcon } from '@heroicons/react/24/outline';
import AuthModal from '@/components/auth/AuthModal';
import AccountLayout from '@/components/layout/AccountLayout';

export default function OrdersPage() {
  const { isAuthenticated, customer } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => sdk.orders.getAll(),
    enabled: isAuthenticated,
  });



  if (isLoading) {
    return (
      <AccountLayout>
        <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AccountLayout>
    );
  }

  if (error) {
    return (
      <AccountLayout>
        <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Error</h1>
            <p className="text-muted-foreground">Server Error</p>
          </div>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <ShoppingBagIcon className="h-8 w-8 text-emerald-400 mr-3" />
            <h1 className="text-3xl font-extrabold text-white">Orders ({orders?.data?.length || 0})</h1>
          </div>
        </div>
        {!orders?.data || orders.data.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBagIcon className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">No Orders Found</h2>
            <p className="text-zinc-400 mb-6">You haven't placed any orders yet</p>
            <Link href="/products">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-3 font-bold">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.data.map((order: any) => (
              <div key={order.id} className="bg-zinc-900/60 border-2 border-zinc-800/50 rounded-2xl shadow-xl hover:shadow-emerald-500/10 transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">Order #{order.id}</h3>
                      <p className="text-sm text-zinc-400">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col sm:text-right gap-2">
                      <div className="text-lg font-bold text-emerald-400">
                        {order.human_format?.total_formatted?.replace('$', '').replace('USD', '').replace('ر.س', '').trim()
                          ? 'ر.س' + order.human_format.total_formatted.replace('$', '').replace('USD', '').replace('ر.س', '').trim()
                          : (typeof order.total === 'object' ?
                            'ر.س' + (order.total.formatted as string).replace('$', '').replace('USD', '').replace('ر.س', '').trim() :
                            `ر.س${(order.total as number).toFixed(2)}`)}
                      </div>
                      <div className="flex items-center justify-start sm:justify-end">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                          order.status.name === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-400' :
                          order.status.name === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-400' :
                          order.status.name === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-400' :
                          'bg-blue-500/10 text-blue-400 border border-blue-400'
                        }`}>
                          {order.status.human_format?.text || order.status.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                        {order.items.slice(0, 3).map((item: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 flex-shrink-0 bg-zinc-800/40 rounded-lg p-2">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0">
                              {item.product?.image?.full_link ? (
                                <img
                                  src={item.product.image.full_link}
                                  alt={item.product_name || item.name || ''}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                                  📦
                                </div>
                              )}
                            </div>
                            <div className="text-sm min-w-0">
                              <div className="font-medium text-white truncate max-w-28 sm:max-w-32">
                                {item.product_name || item.name}
                              </div>
                              <div className="text-zinc-400 text-xs">Quantity: {item.quantity}</div>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-sm text-zinc-400 flex-shrink-0 bg-zinc-800/30 rounded-lg px-3 py-2">
                            +{order.items.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm text-zinc-400">{order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}</div>
                    <Link href={`/order/${order.id}`}>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl">
                        <EyeIcon className="h-4 w-4 mr-2" />View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
