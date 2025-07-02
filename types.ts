export interface Route {
  id: string;
  origin: string;
  destination: string;
  name: string;
}

export interface TrafficComparisonInfo {
  via: string;
  estimatedTime: string;
  distance: string;
  incidents: string[];
  detailedExplanation: string;
}

export interface TrafficInfo {
  estimatedTime: string;
  incidents: string[];
  lastChecked: string;
  comparisons: TrafficComparisonInfo[];
}

export enum NotificationType {
  PUSH = 'Notificación Push',
  EMAIL = 'Email',
  SMS = 'SMS',
}

export interface Settings {
  notificationTime: string;
  notificationType: NotificationType;
}
