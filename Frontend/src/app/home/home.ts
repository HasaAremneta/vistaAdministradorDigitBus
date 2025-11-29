import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AdminNavbar } from "../admin/admin-navbar/admin-navbar";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AdminNavbar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home{
  userName: string = localStorage.getItem('username') || 'Administrador';
}
