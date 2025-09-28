import { Fn } from "./types";

export const $ = <
  BoundArgs extends any[],
  CallArgs extends any[],
  Ret>(
    f: Fn<[...BoundArgs, ...CallArgs], Ret>,
    ...boundArgs: BoundArgs
  ) =>
  (...args: CallArgs) =>
    f(...boundArgs, ...args)

export const $$ = <
  BoundArgs extends any[],
  CallArgs extends any[],
  Ret>(
    f: Fn<[...CallArgs, ...BoundArgs], Ret>,
    ...boundArgs: BoundArgs
  ) =>
  (...args: CallArgs) =>
    f(...args, ...boundArgs)