/**
 * Hook for managing assets with IndexedDB persistence
 */

import { useState, useEffect, useCallback } from 'react';
import type { Asset } from '../types';
import { getAllAssets, saveAsset, getAsset, deleteAsset, initDBWithMockData } from '../services/indexeddb';
import { logger } from '../utils/logger';

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load assets from IndexedDB
  const loadAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize DB and seed mock data if empty
      await initDBWithMockData();
      
      const loadedAssets = await getAllAssets();
      setAssets(loadedAssets);
      logger.debug('Assets loaded', { count: loadedAssets.length }, 'ASSETS');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load assets');
      setError(error);
      logger.error('Failed to load assets', { error: error.message }, 'ASSETS');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load assets on mount
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Add new asset
  const addAsset = useCallback(async (asset: Asset) => {
    try {
      await saveAsset(asset);
      setAssets(prev => [...prev, asset]);
      logger.debug('Asset added', { assetId: asset.id }, 'ASSETS');
      return asset;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add asset');
      logger.error('Failed to add asset', { error: error.message, assetId: asset.id }, 'ASSETS');
      throw error;
    }
  }, []);

  // Update asset
  const updateAsset = useCallback(async (asset: Asset) => {
    try {
      await saveAsset(asset);
      setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
      logger.debug('Asset updated', { assetId: asset.id }, 'ASSETS');
      return asset;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update asset');
      logger.error('Failed to update asset', { error: error.message, assetId: asset.id }, 'ASSETS');
      throw error;
    }
  }, []);

  // Delete asset
  const removeAsset = useCallback(async (assetId: string) => {
    try {
      await deleteAsset(assetId);
      setAssets(prev => prev.filter(a => a.id !== assetId));
      logger.debug('Asset deleted', { assetId }, 'ASSETS');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete asset');
      logger.error('Failed to delete asset', { error: error.message, assetId }, 'ASSETS');
      throw error;
    }
  }, []);

  // Get asset by ID
  const getAssetById = useCallback(async (assetId: string): Promise<Asset | undefined> => {
    try {
      return await getAsset(assetId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get asset');
      logger.error('Failed to get asset', { error: error.message, assetId }, 'ASSETS');
      throw error;
    }
  }, []);

  return {
    assets,
    isLoading,
    error,
    addAsset,
    updateAsset,
    removeAsset,
    getAssetById,
    refreshAssets: loadAssets,
  };
}

