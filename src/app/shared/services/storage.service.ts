import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  set<T>(key: string, data: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  remove(key: string): unknown {
    try {
      return sessionStorage.removeItem(key);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
