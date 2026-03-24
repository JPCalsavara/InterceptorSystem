import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutStateService {
  private readonly sidebarCollapsedStorageKey = 'layout.sidebarCollapsed';

  leftDrawerOpen = signal(false);
  rightDrawerOpen = signal(false);
  sidebarCollapsed = signal(false);

  constructor() {
    const stored = localStorage.getItem(this.sidebarCollapsedStorageKey);
    this.sidebarCollapsed.set(stored === '1');
  }

  toggleSidebarCollapsed(): void {
    const nextValue = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(nextValue);
    localStorage.setItem(this.sidebarCollapsedStorageKey, nextValue ? '1' : '0');
  }

  closeAll(): void {
    this.leftDrawerOpen.set(false);
    this.rightDrawerOpen.set(false);
  }
}
