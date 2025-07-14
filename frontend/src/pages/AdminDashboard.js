import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  FlagIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [reportedAds, setReportedAds] = useState([]);
  const [reportedUsers, setReportedUsers] = useState([]);
  const [pendingAds, setPendingAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, pendingRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/reports'),
        fetch('/api/admin/ads?status=pending')
      ]);

      const [statsData, reportsData, pendingData] = await Promise.all([
        statsRes.json(),
        reportsRes.json(),
        pendingRes.json()
      ]);

      if (statsData.success) setStats(statsData.data.stats);
      if (reportsData.success) {
        setReportedAds(reportsData.data.reportedAds);
        setReportedUsers(reportsData.data.reportedUsers);
      }
      if (pendingData.success) setPendingAds(pendingData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAd = async (adId) => {
    try {
      const response = await fetch(`/api/admin/ads/${adId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Ad approved successfully');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error approving ad:', error);
      alert('Failed to approve ad');
    }
  };

  const handleRejectAd = async (adId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/ads/${adId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      if (data.success) {
        alert('Ad rejected successfully');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error rejecting ad:', error);
      alert('Failed to reject ad');
    }
  };

  const handleBanUser = async (userId) => {
    const reason = prompt('Reason for ban:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      if (data.success) {
        alert('User banned successfully');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    }
  };

  const handleSuspendUser = async (userId) => {
    const duration = prompt('Suspension duration (days):', '7');
    if (!duration) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ duration: parseInt(duration) })
      });

      const data = await response.json();
      if (data.success) {
        alert('User suspended successfully');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage ads, users, and reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAds || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Ads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAds || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <FlagIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Flagged Ads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.flaggedAds || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                { id: 'pending', name: 'Pending Ads', icon: DocumentTextIcon },
                { id: 'reports', name: 'Reports', icon: FlagIcon },
                { id: 'users', name: 'Users', icon: UserGroupIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 inline mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {stats.recentReports && stats.recentReports.map((report, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{report.seller?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{report.title}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Ads Tab */}
            {activeTab === 'pending' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Pending Ads ({pendingAds.length})</h3>
                <div className="space-y-4">
                  {pendingAds.map((ad) => (
                    <div key={ad._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{ad.title}</h4>
                          <p className="text-sm text-gray-600">{ad.description}</p>
                          <p className="text-sm text-gray-500">
                            Posted by {ad.seller?.name} on {new Date(ad.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleApproveAd(ad._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectAd(ad._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            <XCircleIcon className="h-4 w-4 inline mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Reported Ads ({reportedAds.length})</h3>
                <div className="space-y-4">
                  {reportedAds.map((ad) => (
                    <div key={ad._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{ad.title}</h4>
                          <p className="text-sm text-gray-600">{ad.description}</p>
                          <p className="text-sm text-red-600">
                            {ad.reportCount} reports
                          </p>
                          {ad.reports && ad.reports.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Latest reports:</p>
                              {ad.reports.slice(0, 2).map((report, index) => (
                                <p key={index} className="text-xs text-gray-600">
                                  "{report.reason}" - {report.reporter?.name}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleApproveAd(ad._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectAd(ad._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Reported Users ({reportedUsers.length})</h3>
                <div className="space-y-4">
                  {reportedUsers.map((user) => (
                    <div key={user._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-red-600">
                            {user.reportCount} reports
                          </p>
                          <p className="text-sm text-gray-500">
                            Status: {user.status}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleSuspendUser(user._id)}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => handleBanUser(user._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Ban
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 