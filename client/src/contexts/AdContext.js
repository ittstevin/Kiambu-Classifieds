import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdContext = createContext();

export const useAd = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAd must be used within an AdProvider');
  }
  return context;
};

export const AdProvider = ({ children }) => {
  const [savedAds, setSavedAds] = useState([]);
  const [loading, setLoading] = useState(false);

  const createAd = async (adData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/ads', adData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Ad posted successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to post ad';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAd = async (adId, adData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/ads/${adId}`, adData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Ad updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update ad';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAd = async (adId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/ads/${adId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Ad deleted successfully!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete ad';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveAd = async (adId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/ads/${adId}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { saved } = response.data;
      if (saved) {
        setSavedAds(prev => [...prev, adId]);
        toast.success('Ad saved to favorites!');
      } else {
        setSavedAds(prev => prev.filter(id => id !== adId));
        toast.success('Ad removed from favorites!');
      }
      
      return saved;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save ad';
      toast.error(message);
      return false;
    }
  };

  const getSavedAds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/ads/saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedAds(response.data.map(ad => ad._id));
      return response.data;
    } catch (error) {
      console.error('Error fetching saved ads:', error);
      return [];
    }
  };

  const searchAds = async (params) => {
    try {
      setLoading(true);
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`/api/ads/search?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error searching ads:', error);
      return { ads: [], total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const getAdsByCategory = async (category, filters = {}) => {
    try {
      setLoading(true);
      const queryString = new URLSearchParams(filters).toString();
      const response = await axios.get(`/api/ads/category/${category}?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category ads:', error);
      return { ads: [], total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const getAdById = async (adId) => {
    try {
      const response = await axios.get(`/api/ads/${adId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ad:', error);
      return null;
    }
  };

  const getSimilarAds = async (adId, category) => {
    try {
      const response = await axios.get(`/api/ads/${adId}/similar`);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar ads:', error);
      return [];
    }
  };

  const contactSeller = async (adId, message) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/ads/${adId}/contact`, { message }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Message sent to seller!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
      return false;
    }
  };

  const value = {
    loading,
    savedAds,
    createAd,
    updateAd,
    deleteAd,
    toggleSaveAd,
    getSavedAds,
    searchAds,
    getAdsByCategory,
    getAdById,
    getSimilarAds,
    contactSeller,
  };

  return (
    <AdContext.Provider value={value}>
      {children}
    </AdContext.Provider>
  );
}; 