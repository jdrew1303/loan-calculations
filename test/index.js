import test from 'tape-async'
import {getInstallment, getSumPaid, getRpsn} from '../src'

// ------------------------------------------------------------------------------------------------
// Helper methods

/**
 * Creates test description from loan config
 * @param {Object} loanConf
 * @return {string}
 */
const getTestDescription = (loanConf) => `Testing lib for loan settings:
- ${loanConf.amount} loan
- ${loanConf.term} monthly installments
- ${loanConf.interestRate * 100} % interest rate
- installment payday is every ${loanConf.defaultPayDay.toString()}. day in month
- acceptance date is ${loanConf.acceptanceDate.getFullYear()}-${loanConf.acceptanceDate.getMonth() + 1}-${loanConf.acceptanceDate.getDate()}`

// ------------------------------------------------------------------------------------------------
// Tests

/*
 Expected results:
 Výše úvěru: 120 000 Kč
 Měsíčně zaplatíte: 2 700 Kč
 Počet splátek: 60
 Roční úroková sazba: 12,50 %
 RPSN: 13,24 %
 Celkem: 162 000 Kč
 */

// Loan settings
const loanConf = {
  amount: 250000,
  interestRate: 0.139,
  term: 84,
  costs: 0,
  defaultPayDay: 9,
  acceptanceDate: new Date()
}

console.info(getTestDescription(loanConf))

test('installment amount', function (t) {
  const installment = getInstallment(loanConf.amount, loanConf.interestRate, loanConf.term, Math.round)
  t.equal(installment, 4671)
  t.end()
})

test('sum paid', function (t) {
  const installment = getInstallment(loanConf.amount, loanConf.interestRate, loanConf.term, Math.round)
  const result = getSumPaid(loanConf.term, installment, loanConf.acceptanceDate, loanConf.defaultPayDay)
  t.equal(result, 392364)
  t.end()
})

test('loan rpsn', function (t) {
  const installment = getInstallment(loanConf.amount, loanConf.interestRate, loanConf.term)
  const result = getRpsn(loanConf.amount, loanConf.term, installment, loanConf.acceptanceDate, loanConf.defaultPayDay)
  t.equal(result, 14.82)
  t.end()
})
