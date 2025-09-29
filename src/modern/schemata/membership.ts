export interface Membership {
  name: string // name of the membership
  user: number // the user that the membership is assigned to
  recurringPrice: number // price the user has to pay for every period
  validFrom: Date // start of the validity
  validUntil: Date // end of the validity
  state: "planned" | "pending" | "active" | "expired" // indicates the state of the membership
  paymentMethod: "credit card" | "cash" | null // which payment method will be used to pay for the periods
  billingInterval: "weekly" | "monthly" | "yearly" // the interval unit of the periods
  billingPeriods: number // the number of periods the membership has
}

export type MembershipRequest
  = Pick<
    Membership,
    | "name"
    | "paymentMethod"
    | "recurringPrice"
    | "billingInterval"
    | "billingPeriods"
  > & {
    validFrom?: string
  }
