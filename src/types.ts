export interface ABMasonryItem {
    url: string;
    description?: string;
    link?: string;
}

export interface ABMasonryOptions {
    columns?: number;
    gap?: string;
    lazy?: boolean;
    overlayZIndex?: number;
}