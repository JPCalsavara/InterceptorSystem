import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutStateService {
  leftDrawerOpen = signal(false);
  rightDrawerOpen = signal(false);

  closeAll(): void {
    this.leftDrawerOpen.set(false);
    this.rightDrawerOpen.set(false);
  }
}
