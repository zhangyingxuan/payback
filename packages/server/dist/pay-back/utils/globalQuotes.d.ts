export declare function parseGlobalQuotes(text: string): {
    code: string;
    name: string;
    price: number;
    change: number;
    quoteTime: string;
}[];
export declare function parseAsiaQuotes(rows: {
    f12?: string;
    f2?: unknown;
    f3?: unknown;
    f124?: unknown;
}[]): {
    code: string;
    name: string;
    price: number;
    change: number;
    quoteTime: string;
}[];
