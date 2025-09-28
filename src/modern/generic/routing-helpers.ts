import express from "express"
import { Fn } from "./types"
import { SideEffect } from "./doctypes"
import { ParsingFn } from "./parsing"

export type ExpressMiddleware<A> =
  Fn<
    [
      express.Request<any, any, any>, // input request, body unknown
      express.Response<A | { message: string }>,
      express.NextFunction
    ],
    void
  >;

/** Validation middleware using chosen Zod schema.
 *
 * Warning: mutates request body (replacing with validated/transformed result).
 */
export const parse = <A>(parsingFn: ParsingFn<unknown, A>): ExpressMiddleware<A> =>
  (req, res, next) => {
    const bodyParseResult = parsingFn({ ...req.body });
    if ("issues" in bodyParseResult) {
      // respond with first issue (to remain backwards compatible) - all issues could be returned if the team can decide to extend the API with this improvement
      res.status(400).json({ message: bodyParseResult.issues[0] });
    } else {
      (req as any).body = bodyParseResult.data as A; // cast required
      next();
    }
  };


/** Lightweight wrapper ("controller factory") for model code. */
export const handler = <A, B>(
  handler: Fn<[A], SideEffect<B>>,
  opts?: {
    code?: {
      success?: number,
      failure?: number
    },
    onFailure?: Fn<[any], SideEffect<any>>
  }): ExpressMiddleware<B> =>
  (req, res) => {
    const {
      code: { success: successCode = 200, failure: failCode = 500 } = {},
      onFailure
    } = opts ?? {}

    try {
      const result = handler(req.body)
      res.status(successCode).json(result)
    } catch (error) {
      const response = onFailure?.(error)
      if (response === undefined) {
        res.status(failCode)
      } else {
        res.status(failCode).json(response)
      }
    }
  }
