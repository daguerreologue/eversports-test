import { Membership } from "../schemata/membership"
import { MembershipPeriod } from "../schemata/membership-period"
import * as uuid from 'uuid'
import { shiftDate } from "../generic/dates"
import { fold } from "../generic/immutable"
import { range } from "../generic/numeric"
import { push } from "../generic/mutable"
import { Inserts } from "../generic/doctypes"

// DB mocks - controllers would of course IRL need to query some DB, so would be rendered async - this detail is intentionally elided via the mocks
// similarly, some DBMS-abstractions leak into this layer due to the nature of this being a mocked assessment product
// mocks are exported as tests may need to mutate them

export let memberships = require('../../data/memberships.json') as (Membership & { id: number })[]
export let membershipPeriods = require('../../data/membership-periods.json') as MembershipPeriod[]
export const mockUser = { id: 2000 }

// helper to delete a membership and its periods - helps with the flakiness of our mock when testing
export const deleteMembership = (membershipId: number) => {
  if (memberships.length === 0) {
    return
  }
  memberships = memberships.filter(m => m.id !== membershipId)
  membershipPeriods = membershipPeriods.filter(mp => mp.membership !== membershipId)
}

// data-layer handlers
export const createMembership = (membership: Membership): Inserts<[Membership, MembershipPeriod[]], { membership: Membership, membershipPeriods: MembershipPeriod[] }> => {
  const newMembership = {
    ...membership,
    id: memberships.length + 1 // this would be an autoincrement ID from the DBMS IRL
  }
  memberships.push(newMembership)

  const newMembershipPeriods = computeMembershipPeriods(newMembership)
  membershipPeriods.push(...newMembershipPeriods)

  return {
    membership: newMembership,
    membershipPeriods: newMembershipPeriods
  }
}

export const computeMembershipPeriods = (membership: Membership & { id: number }) =>
  fold({
    theSequence: range(1, membership.billingPeriods),
    from: { start: membership.validFrom, periods: [] as MembershipPeriod[] },
    using: ({ start, periods }, id) => {
      const end = shiftDate(start, membership.billingInterval, 1)
      const period = {
        id,
        uuid: uuid.v4(),
        membership: membership.id,
        start,
        end,
        state: "planned" as const,
      }
      return { start: end, periods: push(period, periods) }
    }
  })
    .periods

export const listMemberships = () =>
  memberships.map(membership => ({
    membership,
    periods: membershipPeriods.filter(mp => mp.membership === membership.id) // ideally this would be indexed/prepartitioned, but again, we won't build a DBMS here
  }))
