import { Component, HostListener,OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-navbar.html',
  styleUrl: './admin-navbar.css',
})
export class AdminNavbar implements OnDestroy {

  isSidebarOpen = false;
  currentTime: Date = new Date();
  userName: string = localStorage.getItem('username') || 'Administrador';

  private timerId: any;

  constructor(private router: Router) {
    this.timerId = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const sidebar = document.querySelector('.admin-sidebar');
    const button = document.querySelector('.menu-button');

    if (!sidebar || !button) return;

    if (!sidebar.contains(event.target as Node) &&
        !button.contains(event.target as Node)) {
      this.isSidebarOpen = false;
    }
  }

  logout(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }
}
