import { useState, useEffect } from 'react';
import { venueAPI } from '../services/api';

export const useVenue = () => {
  const [venues, setVenues] = useState([]);
  const [venueNames, setVenueNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVenues = async (userId, venueId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await venueAPI.getDetails(userId, venueId);
      if (response.errorCode === 0) {
        setVenues(response.data || []);
      } else {
        setError(response.errorMessage);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenueNames = async (userId) => {
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
  };

  const saveVenue = async (venueData) => {
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
  };

  return {
    venues,
    venueNames,
    loading,
    error,
    fetchVenues,
    fetchVenueNames,
    saveVenue,
  };
};