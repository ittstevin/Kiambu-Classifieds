import React, { createContext, useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';

const AdsContext = createContext();

export const AdsProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({});
  const [draft, setDraft] = useState(null);

  // Fetch all ads with filters
  const {
    data: ads = [],
    isLoading,
    error,
    refetch,
  } = useQuery(['ads', filters], async () => {
    const params = new URLSearchParams(filters).toString();
    const res = await axios.get(`/api/ads${params ? `?${params}` : ''}`);
    return res.data;
  });

  // Create or update ad draft
  const saveDraft = async (draftData) => {
    setDraft(draftData);
    // Optionally, persist to localStorage or backend
  };

  // Post a new ad
  const createAd = useMutation(
    async (formData) => {
      const res = await axios.post('/api/ads', formData);
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ads');
      },
    }
  );

  // Update an ad
  const updateAd = useMutation(
    async ({ id, formData }) => {
      const res = await axios.put(`/api/ads/${id}`, formData);
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ads');
      },
    }
  );

  // Delete an ad
  const deleteAd = useMutation(
    async (id) => {
      const res = await axios.delete(`/api/ads/${id}`);
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ads');
      },
    }
  );

  return (
    <AdsContext.Provider
      value={{
        ads,
        isLoading,
        error,
        refetch,
        filters,
        setFilters,
        draft,
        setDraft,
        saveDraft,
        createAd,
        updateAd,
        deleteAd,
      }}
    >
      {children}
    </AdsContext.Provider>
  );
};

export const useAds = () => useContext(AdsContext); 