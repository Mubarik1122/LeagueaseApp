import { useState, useCallback } from 'react';
import { venueAPI } from '../services/api';

export const useVenue = () => {
  const [venues, setVenues] = useState([]);
  const [venueNames, setVenueNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVenues = useCallback(async (userId, venueId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await venueAPI.getDetails(userId, venueId);
      if (response.errorCode === 0) {
        const data = response.data;
        setVenues(Array.isArray(data) ? data : data ? [data] : []);
      } else {
        setError(response.errorMessage);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVenueNames = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await venueAPI.getNamesByUserId(userId);
      if (response.errorCode === 0) {
        setVenueNames(response.data || []);
      } else {
        setError(response.errorMessage);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveVenue = useCallback(async (venueData) => {
    try {
      const response = await venueAPI.save(venueData);
      if (response.errorCode === 0) {
        // Refresh venues list
        if (venueData.userId) {
          await fetchVenues(venueData.userId);
        }
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.errorMessage };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchVenues]);

  const deleteVenue = useCallback(async (venueId, userId) => {
    try {
      const response = await venueAPI.deleteById(venueId, userId);
      if (response.errorCode === 0) {
        if (userId) {
          await fetchVenues(userId);
        }
        return { success: true, data: response.data };
      }
      return { success: false, error: response.errorMessage };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchVenues]);

  return {
    venues,
    venueNames,
    loading,
    error,
    fetchVenues,
    fetchVenueNames,
    saveVenue,
    deleteVenue,
  };
};