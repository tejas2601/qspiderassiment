import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Store,
  Star,
  Search,
  Filter,
  MapPin,
  Mail,
  Plus,
  X,
  User,
} from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  totalRatings: number;
  userRating?: number;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface CreateStoreData {
  name: string;
  email: string;
  address: string;
  ownerId: string;
}

const Stores: React.FC = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [createStoreData, setCreateStoreData] = useState<CreateStoreData>({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });

  useEffect(() => {
    fetchStores();
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [searchTerm, sortBy, sortOrder, currentPage]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stores', {
        params: {
          page: currentPage,
          limit: 10,
          name: searchTerm,
          address: searchTerm,
          sortBy,
          sortOrder,
        },
      });
      setStores(response.data.stores);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users', {
        params: { limit: 100, role: 'store_owner' },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/stores', createStoreData);
      toast.success('Store created successfully');
      setShowCreateModal(false);
      setCreateStoreData({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create store');
    }
  };

  const handleRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore || rating === 0) return;

    try {
      await api.post('/ratings', {
        storeId: selectedStore.id,
        rating,
        comment,
      });
      toast.success('Rating submitted successfully');
      setShowRatingModal(false);
      setSelectedStore(null);
      setRating(0);
      setComment('');
      fetchStores();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => interactive && onStarClick && onStarClick(i + 1)}
      />
    ));
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' && 'Manage stores and view all ratings'}
            {user?.role === 'user' && 'Discover and rate amazing stores'}
            {user?.role === 'store_owner' && 'Browse all stores on the platform'}
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Store</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search stores by name or address..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
            >
              <option value="name">Sort by Name</option>
              <option value="averageRating">Sort by Rating</option>
              <option value="totalRatings">Sort by Reviews</option>
              <option value="createdAt">Sort by Date</option>
            </select>
            
            <button
              onClick={() => {
                setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              {sortOrder === 'ASC' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{store.name}</h3>
                <div className="flex items-center space-x-1 mb-2">
                  {renderStars(store.averageRating)}
                  <span className="text-sm text-gray-600 ml-2">
                    ({store.totalRatings} reviews)
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{store.address}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{store.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4" />
                <span className="text-sm">Owner: {store.owner.name}</span>
              </div>
            </div>

            {user?.role === 'user' && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Your rating:</span>
                  {store.userRating ? (
                    <div className="flex items-center space-x-1">
                      {renderStars(store.userRating)}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Not rated</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedStore(store);
                    setRating(store.userRating || 0);
                    setShowRatingModal(true);
                  }}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
                >
                  {store.userRating ? 'Update Rating' : 'Rate Store'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {stores.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No stores found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'No stores have been added yet'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Store Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-90vh overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Store</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  required
                  minLength={20}
                  maxLength={60}
                  value={createStoreData.name}
                  onChange={(e) => setCreateStoreData({ ...createStoreData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter store name (20-60 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={createStoreData.email}
                  onChange={(e) => setCreateStoreData({ ...createStoreData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter store email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  required
                  maxLength={400}
                  rows={3}
                  value={createStoreData.address}
                  onChange={(e) => setCreateStoreData({ ...createStoreData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Enter store address (max 400 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Store Owner
                </label>
                <select
                  required
                  value={createStoreData.ownerId}
                  onChange={(e) => setCreateStoreData({ ...createStoreData, ownerId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select store owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Rate Store</h2>
              <button
                onClick={() => setShowRatingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedStore.name}</h3>
              <p className="text-gray-600">{selectedStore.address}</p>
            </div>

            <form onSubmit={handleRating} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Rating
                </label>
                <div className="flex items-center space-x-1">
                  {renderStars(rating, true, setRating)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rating === 0}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stores;