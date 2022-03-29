export interface IAmpsConnectionInfo {
    name: string;
    url: string[];    
}
export interface IAmpsSubscriptionInfo {
    name: string;
    topic: string;
    options: any;
    filter: string;
    keyField: string;
}
export interface PublicationInfo {
    topic: string;
    payload: any;
}