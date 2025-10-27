'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, Plus } from 'lucide-react';
import { AdminService } from '@/lib/admin-service';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Transaction {
  id: string;
  amount: number;
  type: 'add' | 'withdraw';
  description?: string;
  userEmail?: string;
  userId?: string;
  pointsRedeemed?: number;
  timestamp: any;
}

const TransactionsPage: React.FC = () => {
  const [adminBalance, setAdminBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFundsModal, setShowFundsModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundType, setFundType] = useState<'add' | 'withdraw'>('add');
  const [fundDescription, setFundDescription] = useState('');
  const [fundLoading, setFundLoading] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);

  const adminService = new AdminService();

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const balance = await adminService.getAdminCashBalance();
      setAdminBalance(balance);

      const fetchedTransactions = await adminService.getTransactions();
      setTransactions(fetchedTransactions);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddWithdrawFunds = async () => {
    setFundLoading(true);
    setFundError(null);
    try {
      const amount = parseFloat(fundAmount);
      if (isNaN(amount) || amount <= 0) {
        setFundError('Please enter a valid positive amount.');
        return;
      }

      await addDoc(collection(db, 'admin_transactions'), {
        type: fundType,
        amount: amount,
        description: fundDescription || `${fundType === 'add' ? 'Admin added' : 'Admin withdrew'} funds`,
        timestamp: serverTimestamp(),
      });

      setShowFundsModal(false);
      setFundAmount('');
      setFundDescription('');
      fetchAdminData();
    } catch (err) {
      console.error('Error adding/withdrawing funds:', err);
      setFundError('Failed to process funds. Please try again.');
    } finally {
      setFundLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || transaction.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const formatTimestamp = (timestamp: any) => {
    if (timestamp && timestamp.toDate) {
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) + ' • ' + date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return 'N/A';
  };

  const truncateUserId = (userId: string) => {
    return userId ? `${userId.substring(0, 10)}...` : 'N/A';
  };

  return (
    <div className="min-h-screen bg-green-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 lg:mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Monitor and manage all user transactions</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-4 sm:p-6 rounded-lg shadow-md text-center lg:text-right">
          <div className="text-xs sm:text-sm">Admin Balance</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold">₱{adminBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 lg:mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-auto sm:min-w-[200px]">
          <select
            className="appearance-none w-full pr-9 sm:pr-10 pl-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-sm sm:text-base"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="add">Add Funds</option>
            <option value="withdraw">Withdraw Funds</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="text-center text-gray-500 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4">Loading transactions...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 flex items-center justify-center gap-2 py-12">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">No transactions found.</p>
          <p className="text-sm mt-2">Transaction history will appear here when users redeem points.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                {/* Left side: Details */}
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {transaction.type === 'withdraw' ? 'Points Redemption' : 'Funds Added'}
                  </h3>
                  {transaction.userEmail && (
                    <p className="text-gray-600 text-xs sm:text-sm mb-1 break-all">User: {transaction.userEmail}</p>
                  )}
                  <p className="text-gray-600 text-xs sm:text-sm">{formatTimestamp(transaction.timestamp)}</p>
                </div>

                {/* Right side: Status and Amount */}
                <div className="text-left sm:text-right">
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                    COMPLETED
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    ₱{transaction.amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">CARD</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Funds Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8">
        <button
          onClick={() => { setFundType('add'); setShowFundsModal(true); }}
          className="bg-green-600 hover:bg-green-700 text-white p-3 sm:p-4 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Add Funds"
        >
          <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* Add/Withdraw Funds Modal */}
      {showFundsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              {fundType === 'add' ? 'Add Funds to Admin Balance' : 'Withdraw Funds from Admin Balance'}
            </h2>
            {fundError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{fundError}</span>
              </div>
            )}
            <div className="mb-4">
              <label htmlFor="fundAmount" className="block text-sm font-medium text-gray-700 mb-1">Amount (₱)</label>
              <input
                type="number"
                id="fundAmount"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                placeholder="e.g., 1000"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="fundDescription" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <input
                type="text"
                id="fundDescription"
                value={fundDescription}
                onChange={(e) => setFundDescription(e.target.value)}
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                placeholder="e.g., Initial deposit"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowFundsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                disabled={fundLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddWithdrawFunds}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                disabled={fundLoading}
              >
                {fundLoading ? 'Processing...' : (fundType === 'add' ? 'Add Funds' : 'Withdraw Funds')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;