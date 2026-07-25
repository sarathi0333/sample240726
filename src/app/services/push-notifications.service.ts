import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

/** What `initialize()` settled on, so the UI can explain itself to the user. */
export type PushRegistrationState =
  'idle' | 'unsupported' | 'denied' | 'registering' | 'registered' | 'error';

@Injectable({ providedIn: 'root' })
export class PushNotificationsService {
  private readonly stateSignal = signal<PushRegistrationState>('idle');
  private readonly tokenSignal = signal<string | null>(null);
  private readonly errorSignal = signal<string | null>(null);
  private readonly lastNotificationSignal = signal<PushNotificationSchema | null>(null);

  /** Where registration got to. Drives whatever the UI shows. */
  readonly state = this.stateSignal.asReadonly();
  /** APNs device token, once APNs hands one back. Send this to your server. */
  readonly token = this.tokenSignal.asReadonly();
  /** Human-readable reason registration failed, if it did. */
  readonly error = this.errorSignal.asReadonly();
  /** Most recent push received while the app was in the foreground. */
  readonly lastNotification = this.lastNotificationSignal.asReadonly();

  private initialized = false;

  /**
   * Requests permission and registers with APNs. Safe to call more than once —
   * subsequent calls are ignored so listeners are only attached a single time.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // The plugin has no web implementation; on `ng serve` this would throw.
    if (!Capacitor.isNativePlatform()) {
      this.stateSignal.set('unsupported');
      return;
    }

    this.initialized = true;
    this.stateSignal.set('registering');

    try {
      await this.addListeners();

      let permission = await PushNotifications.checkPermissions();
      if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
        permission = await PushNotifications.requestPermissions();
      }

      if (permission.receive !== 'granted') {
        this.stateSignal.set('denied');
        return;
      }

      // Resolves as soon as the request is handed to APNs — the token itself
      // arrives asynchronously on the `registration` listener below.
      await PushNotifications.register();
    } catch (error) {
      this.fail(error);
    }
  }

  /** Clears every notification this app has left in Notification Center. */
  async clearDelivered(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    await PushNotifications.removeAllDeliveredNotifications();
  }

  private async addListeners(): Promise<void> {
    await PushNotifications.addListener('registration', (token: Token) => {
      this.tokenSignal.set(token.value);
      this.errorSignal.set(null);
      this.stateSignal.set('registered');
    });

    await PushNotifications.addListener('registrationError', (error: unknown) => {
      this.fail(error);
    });

    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        this.lastNotificationSignal.set(notification);
      },
    );

    // Fired when the user taps the notification, including from a cold start.
    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        this.lastNotificationSignal.set(action.notification);
      },
    );
  }

  private fail(error: unknown): void {
    this.errorSignal.set(error instanceof Error ? error.message : JSON.stringify(error));
    this.stateSignal.set('error');
  }
}
