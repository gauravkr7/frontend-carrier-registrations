import { Injectable, Renderer2 } from '@angular/core';
 
@Injectable({
  providedIn: 'root',
})
export class SharedUtilityService {
  constructor() {}
 
  setupOffcanvasClose(renderer: Renderer2): void {
    renderer.listen('window', 'click', (e: Event) => {
      const target = e.target as HTMLElement;
 
      // Prevent closing when clicking inside the offcanvas or on elements with the 'prevent-offcanvas-close' class
      if (
        target.closest('.offcanvas') ||
        target.closest('[data-bs-toggle="offcanvas"]') ||
        target.closest('.prevent-offcanvas-close') || // Class for "Next" button
        target.closest('button') || // Any button
        target.closest('a') // Any anchor link
      ) {
        return;
      }
 
      const offcanvasElements = document.querySelectorAll('.offcanvas.show');
      offcanvasElements.forEach((offcanvas) => {
        if (!offcanvas.contains(target)) {
          (offcanvas as any).classList.remove('show');
          document.body.classList.remove('offcanvas-open');
 
          // Remove Bootstrap's backdrop manually
          const backdrop = document.querySelector('.offcanvas-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
 
          // Reset toggle button state
          const toggleButton = document.querySelector(`[data-bs-target="#${offcanvas.id}"]`);
          if (toggleButton) {
            (toggleButton as HTMLElement).click();
          }
        }
      });
    });
  }
}
 
 