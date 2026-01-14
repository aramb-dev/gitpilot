// src/db/__mocks__/filter-presets.ts
import { db } from "@/db";

export const createFilterPreset = async (
  userId: string,
  name: string,
  filters: any
) => ({
  id: "mock-id",
  userId,
  name,
  filters: JSON.stringify(filters),
});

export const getFilterPresets = async (userId: string) => [];

export const deleteFilterPreset = async (id: string, userId: string) => {};