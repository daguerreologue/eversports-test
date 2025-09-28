export const shiftDate = (date: Date, interval: string, value: number): Date => {
  const shiftedDate = new Date(date)
  switch (interval) {
    case 'monthly':
      shiftedDate.setMonth(shiftedDate.getMonth() + value)
      break
    case 'yearly':
      shiftedDate.setMonth(shiftedDate.getMonth() + (12 * value))
      break
    case 'weekly':
      shiftedDate.setDate(shiftedDate.getDate() + (7 * value))
      break
  }
  return shiftedDate
}