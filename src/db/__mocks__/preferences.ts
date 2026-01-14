// src/db/__mocks__/preferences.ts
import { db } from "@/db";

export const getUserPreferences = async (userId: string) => ({
  userId: userId,
  theme: "dark",
  itemsPerPage: 30,
});

export const updateUserPreferences = async (userId: string, preferences: any) => ({});

export const deleteUserPreferences = async (userId: string) => ({});