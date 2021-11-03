export interface WithNetworkStatus<T> {
    data?: T
    networkStatus: NetworkStatus
}

export enum NetworkStatus {
    None = 1,
    Request,
    Success,
    Failure,
}
