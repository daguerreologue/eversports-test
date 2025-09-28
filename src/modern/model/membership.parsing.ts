import * as uuid from "uuid";
import { MembershipRequest, Membership } from "../../schemata/membership";
import { shiftDate } from "../generic/dates";
import { ParsingFn } from "../generic/parsing";
import { mockUser } from "./membership.model";

export const parseMembership: ParsingFn<MembershipRequest | unknown, Membership> = membershipRequest => {
  const mr = membershipRequest as MembershipRequest
  const issues = []

  if (!mr.name || !mr.recurringPrice) {
    issues.push("missingMandatoryFields")
  }
  if (mr.recurringPrice < 0) {
    issues.push("negativeRecurringPrice")
  }

  if (mr.recurringPrice > 100 && mr.paymentMethod === 'cash') {
    issues.push("cashPriceBelow100")
  }

  switch (mr.billingInterval) {
    case "monthly":
      if (mr.billingPeriods > 12) {
        issues.push("billingPeriodsMoreThan12Months")
      }
      if (mr.billingPeriods < 6) {
        issues.push("billingPeriodsLessThan6Months")
      }
      break
    case "yearly":
      if (mr.billingPeriods > 3) {
        if (mr.billingPeriods > 10) {
          issues.push("billingPeriodsMoreThan10Years")
        } else {
          issues.push("billingPeriodsLessThan3Years")
        }
      }
      break
    case "weekly":
      break
    default:
      issues.push("invalidBillingPeriods")
  }

  const validFrom = mr.validFrom
    ? new Date(mr.validFrom)
    : new Date()

  const validUntil = shiftDate(validFrom, mr.billingInterval, mr.billingPeriods)

  return issues.length !== 0
    ? { issues }
    : {
      data: {
        ...mr,
        uuid: uuid.v4(),
        user: mockUser.id,
        state: validFrom > new Date()
          ? 'pending'
          : validUntil < new Date()
            ? 'expired'
            : 'active',
        validFrom,
        validUntil,
      }
    }
}
