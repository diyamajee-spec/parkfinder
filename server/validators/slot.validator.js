import { z } from 'zod';

export const createSlotSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    location: z.string().min(2, 'Location is required'),
    pricePerHour: z.number().min(0, 'Price must be a positive number'),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    availableSlots: z.number().min(0, 'Available slots must be non-negative'),
    isCovered: z.boolean().optional(),
    securityLevel: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    openingTime: z.string().optional(),
    closingTime: z.string().optional(),
    isEVChargingStation: z.boolean().optional(),
    chargerType: z.enum(["Type 1", "Type 2", "CCS", "CHAdeMO", "None"]).optional(),
  }).passthrough(),
});

export const updateSlotSchema = z.object({
  params: z.object({
    id: z.string().min(24).max(24, 'Invalid slot ID format'),
  }),
  body: z.object({
    name: z.string().optional(),
    location: z.string().optional(),
    pricePerHour: z.number().min(0).optional(),
    capacity: z.number().min(1).optional(),
    availableSlots: z.number().min(0).optional(),
    isCovered: z.boolean().optional(),
    securityLevel: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    openingTime: z.string().optional(),
    closingTime: z.string().optional(),
    isEVChargingStation: z.boolean().optional(),
    chargerType: z.enum(["Type 1", "Type 2", "CCS", "CHAdeMO", "None"]).optional(),
  }).passthrough(),
});
