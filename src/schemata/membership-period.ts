export interface MembershipPeriod {
  membership: number // membership the period is attached to
  start: Date // indicates the start of the period
  end: Date // indicates the end of the period
  state: "issued" | "planned"
}
