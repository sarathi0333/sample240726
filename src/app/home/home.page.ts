import { Component, computed, inject } from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { PushNotificationsService } from '../services/push-notifications.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonNote,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage {
  private readonly push = inject(PushNotificationsService);

  readonly state = this.push.state;
  readonly token = this.push.token;
  readonly error = this.push.error;
  readonly lastNotification = this.push.lastNotification;

  readonly statusLabel = computed(() => {
    switch (this.state()) {
      case 'registered':
        return 'Registered with APNs';
      case 'registering':
        return 'Registering…';
      case 'denied':
        return 'Permission denied';
      case 'unsupported':
        return 'Not available on the web — run on a device';
      case 'error':
        return 'Registration failed';
      default:
        return 'Not started';
    }
  });

  async clearDelivered(): Promise<void> {
    await this.push.clearDelivered();
  }
}
