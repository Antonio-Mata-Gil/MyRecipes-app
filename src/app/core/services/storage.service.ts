import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  // Guardar token de forma segura en almacenamiento nativo
  async setToken(key: string, value: string): Promise<void> {
    try {
      await SecureStoragePlugin.set({
        key,
        value
      });
    } catch (error) {
      console.error('Error saving token to secure storage:', error);
      throw error;
    }
  }

  // Guardar datos de forma segura en Preferences (datos no sensibles)
  async setSecureData(key: string, value: any): Promise<void> {
    try {
      await Preferences.set({
        key,
        value: JSON.stringify(value)
      });
    } catch (error) {
      console.error('Error saving data to preferences:', error);
      throw error;
    }
  }

  // Obtener datos seguros de Preferences
  async getSecureData(key: string): Promise<any> {
    try {
      const result = await Preferences.get({ key });
      return result.value ? JSON.parse(result.value) : null;
    } catch (error) {
      console.error('Error getting data from preferences:', error);
      return null;
    }
  }

  // Obtener token del almacenamiento seguro nativo
  async getToken(key: string): Promise<string | null> {
    try {
      const result = await SecureStoragePlugin.get({ key });
      return result?.value || null;
    } catch (error) {
      console.error('Error getting token from secure storage:', error);
      return null;
    }
  }

  // Eliminar token del almacenamiento seguro nativo
  async removeToken(key: string): Promise<void> {
    try {
      await SecureStoragePlugin.remove({ key });
    } catch (error) {
      console.error('Error removing token from secure storage:', error);
    }
  }

  // Eliminar datos seguros de Preferences
  async removeSecureData(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('Error removing data from preferences:', error);
    }
  }

  // Limpiar todos los datos almacenados en Preferences
  async clearSecureData(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Error clearing preferences:', error);
    }
  }

  // Limpiar almacenamiento seguro
  async clearSecureStorage(): Promise<void> {
    try {
      await SecureStoragePlugin.clear();
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  }
}
