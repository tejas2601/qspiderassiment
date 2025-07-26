import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Users, Store, Star, TrendingUp, Clock, Award } from 'lucide-react';

interface DashboardStats {
  totalUsers?: number;
  totalStores?: number;
  totalRatings?: number;
  averageRating?: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface RecentStore {
  id: string;
  name: string;
  averageRating: number;
  totalRatings: number;
  owner: {
    name: string;
    email: string;
  };
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentStores, setRecentStores] = useState<RecentStore[]>([]);
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (user?.role === 'admin') {
        const response = await api.get('/dashboard/admin');
        setStats(response.data.stats);
        setRecentUsers(response.data.recentUsers);
        setRecentStores(response.data.recentStores);
      } else if (user?.role === 'store_owner') {
        const response = await api.get('/dashboard/store-owner');
        setStoreData(response.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-blue-100">
          {user?.role === 'admin' && "Here's your platform overview"}
          {user?.role === 'user' && "Discover and rate amazing stores"}
          {user?.role === 'store_owner' && "Monitor your store's performance"}
        </p>
      </div>

      {/* Admin Dashboard */}
      {user?.role === 'admin' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalUsers?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Stores</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalStores?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Ratings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalRatings?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Users */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>Recent Users</span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent users</p>
                )}
              </div>
            </div>

            {/* Recent Stores */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span>Recent Stores</span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {recentStores.length > 0 ? (
                  recentStores.map((store) => (
                    <div key={store.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">{store.name}</p>
                        <div className="flex items-center space-x-1">
                          {renderStars(store.averageRating)}
                          <span className="text-sm text-gray-600 ml-2">
                            ({store.totalRatings})
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Owner: {store.owner.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(store.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent stores</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Store Owner Dashboard */}
      {user?.role === 'store_owner' && storeData && (
        <>
          {/* Store Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Average Rating</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.averageRating?.toFixed(1) || '0.0'}
                    </p>
                    <div className="flex items-center">
                      {renderStars(stats.averageRating || 0)}
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Ratings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalRatings?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Store Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Store Information</h3>
            </div>
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{storeData.store.name}</h4>
              <p className="text-gray-600 mb-4">{storeData.store.address}</p>
              <p className="text-sm text-gray-500">Email: {storeData.store.email}</p>
            </div>
          </div>

          {/* Recent Ratings */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Recent Ratings</h3>
            </div>
            <div className="p-6 space-y-4">
              {storeData.store.ratings?.length > 0 ? (
                storeData.store.ratings.slice(0, 5).map((rating: any) => (
                  <div key={rating.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">{rating.user.name}</p>
                      <div className="flex items-center space-x-1">
                        {renderStars(rating.rating)}
                      </div>
                    </div>
                    {rating.comment && (
                      <p className="text-gray-600 text-sm">{rating.comment}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(rating.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No ratings yet</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* User Dashboard */}
      {user?.role === 'user' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <Store className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Stores</h3>
            <p className="text-gray-600 mb-4">
              Discover amazing stores in your area and see what others are saying about them.
            </p>
            <a
              href="/stores"
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200"
            >
              View All Stores
            </a>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Rate Stores</h3>
            <p className="text-gray-600 mb-4">
              Share your experience by rating stores and help other users make informed decisions.
            </p>
            <a
              href="/stores"
              className="inline-block bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Start Rating
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;