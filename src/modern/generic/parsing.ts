import { Fn } from "./types"

export type ParseResult<A> = { data: A } | { issues: any[] }
export type ParsingFn<A, B> = Fn<[A], ParseResult<B>>