/** Notates a procedure running one of more side effects, finally returning A. */
export type SideEffect<A> = A;

/** Notates the side effect of inserting A to some persistance layer, returning B. */
export type Inserts<A, B = void> = B;