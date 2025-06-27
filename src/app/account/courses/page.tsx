'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/store-api';
import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';
import AccountLayout from '@/components/layout/AccountLayout';

export default function CoursesPage() {
  const { t } = useTranslation();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['user-courses'],
    queryFn: async () => {
      // Placeholder until courses API is implemented
      return [];
    },
  });

  return (
    <AccountLayout>
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl p-8">
        <h3 className="text-2xl font-extrabold text-white mb-6">My Courses</h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border-2 border-zinc-800/50 rounded-2xl p-6 bg-zinc-900/60"></div>
            ))}
          </div>
        ) : courses?.length ? (
          <div className="space-y-4">
            {courses.map((enrollment: any) => (
              <div key={enrollment.id} className="border-2 border-zinc-800/50 rounded-2xl p-6 bg-zinc-900/60 hover:shadow-emerald-500/10 transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">{enrollment.course?.title}</h4>
                  <span className="text-sm font-bold text-blue-400">{enrollment.progress}% Complete</span>
                </div>
                
                {enrollment.course?.description && (
                  <p className="text-zinc-400 mb-4">{enrollment.course.description}</p>
                )}
                
                <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${enrollment.progress}%` }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-400">
                    {enrollment.is_active ? (
                      <span className="text-emerald-400 font-bold">● Active</span>
                    ) : (
                      <span className="text-red-400 font-bold">● Inactive</span>
                    )}
                  </div>
                  <Link href={`/courses/${enrollment.id}`} className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors duration-200">
                    Continue Learning →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Enrolled Courses</h3>
            <p className="text-zinc-400 mb-6">You haven't enrolled in any courses yet</p>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}