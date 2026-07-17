export type NotificationType = "application" | "application_response" | "payment";

export interface MarketplaceNotification {
    id: string;
    recipientId: string;
    type: NotificationType;
    message: string;
    read: boolean;
    createdAt: number;
    link?: string;
}
