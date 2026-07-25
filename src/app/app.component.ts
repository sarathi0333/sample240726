import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { PushNotificationsService } from './services/push-notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private readonly push = inject(PushNotificationsService);

  ngOnInit(): void {
    // No-ops on the web; only registers when running natively.
    void this.push.initialize();
  }
}
