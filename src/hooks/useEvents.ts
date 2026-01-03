/**
 * Hook for managing events with IndexedDB persistence
 */

import { useState, useEffect, useCallback } from 'react';
import type { Event, Status } from '../types';
import { getAllEvents, saveEvent, getEvent, getEventsByAsset, updateEventStatus, deleteEvent, initDBWithMockData } from '../services/indexeddb';
import { logger } from '../utils/logger';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load events from IndexedDB
  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize DB and seed mock data if empty
      await initDBWithMockData();
      
      const loadedEvents = await getAllEvents();
      setEvents(loadedEvents);
      logger.debug('Events loaded', { count: loadedEvents.length }, 'EVENTS');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load events');
      setError(error);
      logger.error('Failed to load events', { error: error.message }, 'EVENTS');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Add new event
  const addEvent = useCallback(async (event: Event) => {
    try {
      await saveEvent(event);
      setEvents(prev => [event, ...prev]);
      logger.debug('Event added', { eventId: event.id, assetId: event.assetId }, 'EVENTS');
      return event;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add event');
      logger.error('Failed to add event', { error: error.message, eventId: event.id }, 'EVENTS');
      throw error;
    }
  }, []);

  // Update event
  const updateEvent = useCallback(async (event: Event) => {
    try {
      await saveEvent(event);
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      logger.debug('Event updated', { eventId: event.id }, 'EVENTS');
      return event;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update event');
      logger.error('Failed to update event', { error: error.message, eventId: event.id }, 'EVENTS');
      throw error;
    }
  }, []);

  // Update event status (for attestation)
  const updateEventStatusAndTxHash = useCallback(async (eventId: string, status: Status, txHash: string) => {
    try {
      await updateEventStatus(eventId, status, txHash);
      setEvents(prev => prev.map(e => 
        e.id === eventId ? { ...e, status, txHash } : e
      ));
      logger.debug('Event status updated', { eventId, status, txHash }, 'EVENTS');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update event status');
      logger.error('Failed to update event status', { error: error.message, eventId }, 'EVENTS');
      throw error;
    }
  }, []);

  // Delete event
  const removeEvent = useCallback(async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      logger.debug('Event deleted', { eventId }, 'EVENTS');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete event');
      logger.error('Failed to delete event', { error: error.message, eventId }, 'EVENTS');
      throw error;
    }
  }, []);

  // Get events by asset ID
  const getEventsForAsset = useCallback(async (assetId: string): Promise<Event[]> => {
    try {
      return await getEventsByAsset(assetId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get events for asset');
      logger.error('Failed to get events for asset', { error: error.message, assetId }, 'EVENTS');
      throw error;
    }
  }, []);

  // Get event by ID
  const getEventById = useCallback(async (eventId: string): Promise<Event | undefined> => {
    try {
      return await getEvent(eventId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get event');
      logger.error('Failed to get event', { error: error.message, eventId }, 'EVENTS');
      throw error;
    }
  }, []);

  return {
    events,
    isLoading,
    error,
    addEvent,
    updateEvent,
    updateEventStatusAndTxHash,
    removeEvent,
    getEventsForAsset,
    getEventById,
    refreshEvents: loadEvents,
  };
}

