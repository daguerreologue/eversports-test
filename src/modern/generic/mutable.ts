// we all like FP and putting things in terms of nice data transformation pipelines, but trying to fit that with JS mutable collections are not very performant - these functions can help as an adapter layer

/** Mutably push element to array, returning the array. */
export const push = <A>(x: A, xs: A[]) => {
  xs.push(x)
  return xs
}