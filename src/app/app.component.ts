import { Component, signal, effect, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { CommonModule, NgIf } from '@angular/common';
import { NavComponent } from './nav/nav.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastContainerComponent } from "./core/toast-container.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NgIf, NavComponent,
    HttpClientModule, FormsModule, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn = signal(false);
  username = signal('');
  private tokenRefreshInterval: any; // Store interval ID for cleanup

  constructor(private keycloak: KeycloakService, private router: Router) {
     this.avatarUrl = this.getAvatarForUser(this.username());
    // Optional: Log signal changes for debugging
    effect(() => {
      console.log('isLoggedIn:', this.isLoggedIn());
      console.log('username:', this.username());
    });
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    // Clear interval to prevent memory leaks
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
    }
  }

  private async init() {
    try {
      await this.updateUserStatus();

      // Auto-refresh token every 60 seconds
      this.tokenRefreshInterval = setInterval(async () => {
        try {
          const refreshed = await this.keycloak.updateToken(30);
          if (refreshed) {
            console.log('Token refreshed successfully');
          }
          await this.updateUserStatus();
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }, 60000); // 60 seconds
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  }

  private async updateUserStatus() {
    try {
      const loggedIn = await this.keycloak.isLoggedIn();
      this.isLoggedIn.set(loggedIn);

      if (loggedIn) {
        const profile = await this.keycloak.loadUserProfile();
        this.username.set(profile.username || profile.firstName || 'User');
      } else {
        this.username.set('');
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
      this.isLoggedIn.set(false);
      this.username.set('');
    }
  }

  async logout() {
    try {
      await this.keycloak.logout(window.location.origin + '/login');
      this.isLoggedIn.set(false);
      this.username.set('');
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }


  // Example: assign avatar based on username hash OR get from backend
  avatarUrl: string = '';

  private avatars = [
    'assets/avatars/avatar1.png',
    'assets/avatars/avatar2.png',
    'assets/avatars/avatar3.png'
  ];



  getAvatarForUser(name: string): string {
    // Simple: hash username → pick one of the avatars
    const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this.avatars[hash % this.avatars.length];
  }


}