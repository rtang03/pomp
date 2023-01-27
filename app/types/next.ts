export declare type Params<P> = { [key in keyof P]: string };
export declare type GenerateStaticParams<P extends Params<P>> = () => Promise<P[]>;
