// ------------------------------------------------------------------------------------------------
// Helper methods

/**
 * Rounds number to two decimal points
 * @param number {number} Number to round
 * @return {number}
 */
function round (number) {
  return Math.round(number * 100) / 100
}

/**
 * Converts milliseconds to days
 * @param time {number} Time in milliseconds
 * @returns {number}
 */
function millisecondsToDays (time) {
  return Math.round(time / (1000 * 60 * 60 * 24))
}

/**
 * Calculates a product of array of numbers
 * @param arrayOfNumbers  Array of numbers
 * @returns {number}
 */
function product (arrayOfNumbers) {
  return arrayOfNumbers.reduce((n, r) => n * r, 1)
}

/**
 * Calculates a sum of array of numbers
 * @param arrayOfNumbers  Array of numbers
 * @returns {number}
 */
function sum (arrayOfNumbers) {
  return arrayOfNumbers.reduce((n, r) => n + r, 0)
}

/**
 * Number of days in month of specified installment payment (ignores payment date)
 * @param loan {Object} Loan object
 *    @property acceptanceDate {Date} Loan start date
 * @param i {number} Installment number
 * @returns {number}
 */
function getDaysInInstallmentMonth ({acceptanceDate}, i) {
  return new Date(acceptanceDate.getFullYear(), acceptanceDate.getMonth() + i + 1, 0).getDate()
}

/**
 * Get days in period for specified installment payment (doesn't ignore payment date)
 * @param loan {Object} Loan object
 *    @property defaultPayDay {number} Default installment payment day
 *    @property acceptanceDate {Date} Loan start date
 * @param i {number} Installment number
 * @returns {number}
 */
function getDaysInInstallmentPeriod ({defaultPayDay, acceptanceDate}, i) {
  const payDay = getInstallmentPaymentDay(defaultPayDay, getDaysInInstallmentMonth(acceptanceDate, i))
  return millisecondsToDays(
    getInstallmentPaymentDate(acceptanceDate, payDay, i)
      .valueOf() - getInstallmentPaymentDate(acceptanceDate, payDay, i - 1).valueOf()
  )
}

/**
 * Proper installment pay day for remaining month length
 *    @property defaultPayDay {number} Default installment payment day
 * @param daysInInstallmentMonth {number} Number of days in installment month
 * @returns {number}
 */
function getInstallmentPaymentDay ({defaultPayDay}, daysInInstallmentMonth) {
  return defaultPayDay > daysInInstallmentMonth ? daysInInstallmentMonth : defaultPayDay
}

/**
 * Get installment date
 * @param loan {Object} Loan object
 *    @property acceptanceDate {Date} Loan acceptance date
 * @param payDay {number} Proper installment payday
 * @param i {number} Installment num
 * @returns {Date}
 */
function getInstallmentPaymentDate ({acceptanceDate}, payDay, i) {
  if (i < 1) return acceptanceDate
  const resultDate = getInstallmentPaymentDate(acceptanceDate, payDay, i - 1)
  return new Date(resultDate.getFullYear(), resultDate.getMonth() + 1, payDay)
}

/**
 * Get days from acceptance date
 * @param loan {Object} Loan object
 *    @property defaultPayDay {number} Default installment payment day
 *    @property acceptanceDate {Date} Loan acceptance date
 * @param i {number} Installment num
 * @returns {number}
 */
function getDaysFromAcceptance ({defaultPayDay, acceptanceDate}, i) {
  return i < 1
    ? 0
    : getDaysInInstallmentPeriod(defaultPayDay, acceptanceDate, i) + getDaysFromAcceptance(defaultPayDay, acceptanceDate, i - 1)
}

// ------------------------------------------------------------------------------------------------
// Exported interface

/**
 * Get installments sum
 * @param loan {Object} Loan object
 *    @property installment {number} Single installment value
 *    @property term {number} Number on installments (monthly payments)
 * @returns {Promise}
 */
export function getSumPaid ({installment, term, ...rest}) {
  return new Promise(resolve => {
    if (!installment || !term) throw new Error('Installment amount and term must be defined')
    const sumPaid = installment * term
    resolve({
      installment,
      term,
      sumPaid, ...rest
    })
  })
}

/**
 * Get trivial loan cost (sum overpaid)
 * @param loan {Object} Loan object
 *    @property amount {number} Loan amount
 *    @property sumPaid {number} Installments sum
 * @returns {Promise}
 */
export function getLoanCost ({amount, sumPaid, ...rest}) {
  return new Promise(resolve => {
    if (!amount || !sumPaid) throw new Error('Loan amount and sum paid must be defined')
    const loanCost = sumPaid - amount
    resolve({
      amount,
      sumPaid,
      loanCost, ...rest
    })
  })
}

/**
 * Single installment value
 * @param loan {Object} Loan object
 *    @property amount {number} Loan amount
 *    @property interestRate {number} Loan interest rate
 *    @property term {number} Number on installments (monthly payments)
 * @returns {Promise}
 */
export function getInstallment ({amount, interestRate, term, ...rest}) {
  return new Promise(resolve => {
    if (!amount || !interestRate || !term) throw new Error('Loan amount, interest rate and term must be defined')
    const installment = Math.round(amount * ((interestRate / 12) / (1 - Math.pow(1 + interestRate / 12, -(term / 12) * 12))))
    resolve({
      amount,
      interestRate,
      term,
      installment, ...rest
    })
  })
}

/**
 * Get loan RPSN (APR - annual percentage rate)
 * @param loan {Object} Loan object
 *    @property amount {number} Loan amount
 *    @property interestRate {number} Loan interest rate
 *    @property term {number} Number on installments (monthly payments)
 *    @property costs {number} Other monthly costs
 * @returns {Promise}
 */
export function getRpsn ({amount, term, interestRate, costs = 0, ...rest}) {
  return new Promise(resolve => {
    var monthlyRate = interestRate / 12 // @FIXME tohle je jádro pudla, měsíční sazba není úrok / 12, protože intervaly splátek nejsou stejně dlouhé
    var totalMonthPayment = ((amount + costs) * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1)
    var testRate = monthlyRate
    var iteration = 1
    var testResult = 0
    // iterate until result = 0
    var testDiff = testRate
    while (iteration <= 100) {
      testResult = ((testRate * Math.pow(1 + testRate, term)) / (Math.pow(1 + testRate, term) - 1)) - (totalMonthPayment / amount)
      if (Math.abs(testResult) < 0.0000001) break
      if (testResult < 0) testRate += testDiff
      else testRate -= testDiff
      testDiff = testDiff / 2
      iteration++
    }
    testRate = testRate * 12
    const rpsn = round(testRate * 100)
    resolve({
      rpsn,
      amount,
      term,
      interestRate,
      costs,
      ...rest
    })
  })
}

/**
 * Calculates number of installments in loan
 * @param loan {Object} Loan object
 *    @property amount {number} Loan amount
 *    @property installment {number} Installment amount
 *    @property interestRate {number} Loan interest rate
 * @return {Promise}
 */
export function getInstallmentCount ({amount, installment, interestRate, ...rest}) {
  return new Promise(resolve => {
    if (!amount || !installment || !interestRate) throw new Error('Loan amount, installment amount and interest rate are required')
    var term
    if (interestRate == 0) {
      term = Math.ceil(amount / installment)
    }
    else {
      term = Math.ceil(round(Math.log(interestRate * amount / (amount * (1 + interestRate)) + 1) / Math.log(1 + interestRate), 4))
      if (term > 0) {
        var c = round(amount * ( (1 + interestRate) * (Math.pow(1 + interestRate, term) - 1) / interestRate ))
        if (c > amount) {
          c = amount - amount * ( (1 + interestRate) * (Math.pow(1 + interestRate, term - 1) - 1) / interestRate )
          term = (term - 1) * 12 + Math.ceil(c / installment)
        }
        else term = term * 12
      }
      else term = 0
    }
    resolve({
      term,
      amount,
      installment,
      interestRate, ...rest
    })
  })
}

