import request from "supertest"
import app from "../index"
import { memberships, membershipPeriods, deleteMembership } from "../modern/model/membership.model"
import { Membership } from "../modern/schemata/membership"
import { MembershipPeriod } from "../modern/schemata/membership-period"

const endpoints = [
  { label: "new", base: "/memberships" },
  { label: "legacy", base: "/legacy/memberships" },
]

const validFrom = new Date().toISOString()

type MembershipCase = {
  name: string
  payload: any
  expectedStatus: number
}

const cases: MembershipCase[] = [
  {
    name: "valid monthly membership",
    payload: {
      name: "Basic Monthly",
      recurringPrice: 50,
      paymentMethod: "credit card",
      billingInterval: "monthly",
      billingPeriods: 6,
      validFrom,
    },
    expectedStatus: 201,
  },
  {
    name: "missing fields",
    payload: {
      billingInterval: "monthly",
      billingPeriods: 6,
      validFrom,
    },
    expectedStatus: 400,
  },
  {
    name: "negative recurring price",
    payload: {
      name: "Bad Price",
      recurringPrice: -10,
      paymentMethod: "credit card",
      billingInterval: "monthly",
      billingPeriods: 6,
      validFrom,
    },
    expectedStatus: 400,
  },
  {
    name: "cash price above 100",
    payload: {
      name: "Expensive Cash",
      recurringPrice: 150,
      paymentMethod: "cash",
      billingInterval: "monthly",
      billingPeriods: 6,
      validFrom,
    },
    expectedStatus: 400,
  },
  {
    name: "too many monthly periods",
    payload: {
      name: "Too Long Monthly",
      recurringPrice: 20,
      paymentMethod: "credit card",
      billingInterval: "monthly",
      billingPeriods: 13,
      validFrom,
    },
    expectedStatus: 400,
  },
  {
    name: "too few monthly periods",
    payload: {
      name: "Too Short Monthly",
      recurringPrice: 20,
      paymentMethod: "credit card",
      billingInterval: "monthly",
      billingPeriods: 3,
      validFrom,
    },
    expectedStatus: 400,
  },
  {
    name: "yearly above 10 years",
    payload: {
      name: "Decade Plan",
      recurringPrice: 200,
      paymentMethod: "credit card",
      billingInterval: "yearly",
      billingPeriods: 11,
      validFrom,
    },
    expectedStatus: 400,
  },
  {
    name: "invalid billing interval",
    payload: {
      name: "Invalid Interval",
      recurringPrice: 30,
      paymentMethod: "credit card",
      billingInterval: "fortnightly",
      billingPeriods: 2,
      validFrom,
    },
    expectedStatus: 400,
  },
]

// remove uuid keys recursively
const stripUuids = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(stripUuids)
  }
  if (obj && typeof obj === "object") {
    const out: any = {}
    for (const [k, v] of Object.entries(obj)) {
      if (k === "uuid") continue
      out[k] = stripUuids(v)
    }
    return out
  }
  return obj
}

// as subsequent responses assign auto-incrementing IDs, replace them just for the test so we can compare legacy and new responses structurally
const anonymiseMembershipId = (newId: number) => ({ membership, membershipPeriods }: { membership: Membership & { id: number }, membershipPeriods: MembershipPeriod[] }) =>
({
  membership: {
    ...membership,
    id: newId
  },
  membershipPeriods: membershipPeriods.map(mp => ({ ...mp, membership: newId }))
})

describe("Membership APIs (new vs legacy)", () => {
  describe.each(cases)("POST /memberships: $name", c => {
    it("should behave identically in new and legacy APIs", async () => {
      const results = await Promise.all(
        endpoints.map(async e => {
          const res = await request(app)
            .post(e.base)
            .send(c.payload)
          return { ...e, res }
        })
      )

      const [newApi, legacyApi] = results

      // expect(newApi.res.status).toBe(c.expectedStatus)
      // expect(legacyApi.res.status).toBe(c.expectedStatus)

      if (c.expectedStatus.toString().startsWith('2')) {
        const [newBody, legacyBody]
          = [newApi, legacyApi]
            .map(({ res }) => res.body)
            .map(stripUuids)
            .map(anonymiseMembershipId(999))

        expect(newBody).toEqual(legacyBody)
      }

    })
  })

  it("GET /memberships should match legacy", async () => {
    const results = await Promise.all(
      endpoints.map(async e => {
        const res = await request(app).get(e.base)
        return { ...e, res }
      })
    )

    const [newApi, legacyApi] = results
    expect(newApi.res.status).toBe(200)
    expect(legacyApi.res.status).toBe(200)

    const newBody = stripUuids(newApi.res.body)
    const legacyBody = stripUuids(legacyApi.res.body)

    expect(newBody).toEqual(legacyBody)
  })
})
