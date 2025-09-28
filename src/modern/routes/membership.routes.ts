import express from "express"
import { createMembership, listMemberships } from "../controllers/membership.controllers";
import { parse } from "../generic/routing-helpers";
import { parseMembership } from "../model/membership.parsing";

const router = express.Router();

router.get("/", listMemberships)

router.post("/", parse(parseMembership), createMembership)

export default router;
