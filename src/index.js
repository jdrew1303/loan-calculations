/*
 * general helper functions
 */

const copyDate = date => new Date(date.getTime())

// 2016-11-30T23:55:55 -> 2016-11-30T00:00:00
const stripTime = date => {
  let copy = copyDate(date)
  copy.setUTCHours(0, 0, 0, 0, 0)
  return copy
}

// 2016-11-30 -> 2016-12-30
// 2016-12-30 -> 2017-01-30
const incrementMonth = date => {
  let copy = copyDate(date)
  if (copy.getUTCMonth() === 11) {
    copy.setUTCFullYear(copy.getUTCFullYear() + 1)
    copy.setUTCMonth(0)
  } else {
    copy.setUTCMonth(copy.getUTCMonth() + 1)
  }
  return copy
}

// 2016-11-30, 2016-12-01 -> 1
const dayDifference = (d1, d2) => {
  const milliseconds = stripTime(d2) - stripTime(d1)
  return Math.round(milliseconds / (1000 * 60 * 60 * 24))
}

// https://github.com/mikolalysenko/bisect/blob/master/bisect.js
// Supposing that predicate is monotone over the interval [lo,hi), finds the
// first occurence of where predicate is true up to a resolution of tolerance.
const bisect = (pred, lo, hi, tol) => {
  tol = tol || 1e-8
  while (hi - lo > tol) {
    // console.log(lo, hi)  // uncomment this to see the convergence rate
    var m = (hi + lo) / 2
    pred(m) ? hi = m : lo = m
  }
  return lo
}

// 0.17788346856832504 -> 17.79
const round2 = float => Math.round(float * 100) / 100

/*
 * business logic
 */

// 2016-11-06 -> 2016-12-05
// 2016-12-01 -> 2017-01-05
const nextInstallmentDate = (date, installment_day) => {
  let d = incrementMonth(date)
  d.setUTCDate(installment_day)
  return d
}

// this implements the calculation inside the RPSN sum definition
const contribution = (monthly, rpsn) => fraction => monthly * Math.pow(1 + rpsn, -1 * fraction)

/**
 * Calculates a sum of array of numbers
 * @param arrayOfNumbers  Array of numbers
 * @returns {number}
 */
const sum = arrayOfNumbers => arrayOfNumbers.reduce((n, r) => n + r, 0)

/**
 * Calculates total amount paid
 * @param term {number} Number of installments
 * @param monthly {number} Monthly payment
 * @param date {Date} Acceptance date
 * @param installmentDay {number} Day in month of installment payment
 */
const getTotal = (term, monthly, date, installmentDay) => rpsn => {
  // first, we need a list of installment dates
  let dates = [copyDate(date)]
  for (let i = 1; i <= term; i++) {
    dates[i] = nextInstallmentDate(dates[i - 1], installmentDay)
  }
  dates.shift()  // drop the acceptance date

  // now, let's convert those into the number of days into the future
  const fractions = dates.map(d => dayDifference(date, d) / 365.25)

  // from these, calculate a list of monthly contributions to the total
  return sum(fractions.map(contribution(monthly, rpsn)))
}

// ------------------------------------------------------------------------------------------------
// Exported interface

/**
 * Calculates total amount paid
 * @param term {number} Number of installments
 * @param monthly {number} Monthly payment
 * @param date {Date} Acceptance date
 * @param installmentDay {number} Day in month of installment payment
 */
export function getSumPaid (term, monthly, date, installmentDay) {
  return getTotal(term, monthly, date, installmentDay)(0)
}

/**
 * Single installment value
 * @param amount {number} Loan amount
 * @param interestRate {number} Loan interest rate
 * @param term {number} Number on installments (monthly payments)
 * @param roundingFn {Function} Rounding function
 * @returns {Promise}
 */
export function getInstallment (amount, interestRate, term, roundingFn = i => i) {
  if (!amount || !interestRate || !term) throw new Error('Loan amount, interest rate and term must be defined')
  return roundingFn(amount * ((interestRate / 12) / (1 - Math.pow(1 + interestRate / 12, -(term / 12) * 12))))
}

/**
 * Calculates loan yearly percentage rate
 * @param amount {number} Loan amount
 * @param term {number} Number of installments
 * @param monthly {number} Monthly payment
 * @param date {Date} Acceptance date
 * @param installmentDay {number} Day in month of installment payment
 * @example getRpsn(120000, 60, 2700, new Date('2016-07-05'), 5)
 */
export function getRpsn (amount, term, monthly, date, installmentDay) {
  const total = getTotal(term, monthly, stripTime(date), installmentDay)
  const predicate = x => total(x) - amount < 0
  return round2(100 * bisect(predicate, 0, 10))
}
