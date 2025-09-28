import { Fn } from "./types"

export const fold = <A, B>({ from: init, using: f, theSequence: xs }: { from: B, using: Fn<[B, A], B>, theSequence: Iterable<A> }) => {
  let y = init
  for (const x of xs) {
    y = f(y, x)
  }
  return y
}
