import express from "express"
import { MembershipRequest } from "../../schemata/membership"
import * as membershipModel from "../model/membership.model"
import { parseMembership } from "../model/membership.parsing"

//TODO: common patterns, could be generated via factories
export const createMembership = (req: express.Request<any, any, MembershipRequest>, res: express.Response) => {
  const parsedMembership = parseMembership(req.body)
  if ('issues' in parsedMembership) {
    res.status(400).json(parsedMembership.issues[0])
  } else {
    res.status(201).json(membershipModel.createMembership(parsedMembership.data))
  }
}

export const listMemberships = (req: express.Request, res: express.Response) => {
  res.status(200).json(membershipModel.listMemberships())
}