import test from 'tape-async'
import {getInstallment, getLoanCost, getRpsn, getSumPaid, getInstallmentCount} from '../src'

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
- installment payday is every ${loanConf.defaultPayday}
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
  amount: 120000,
  interestRate: 0.125,
  term: 60,
  costs: 0,
  defaultPayDay: 5,
  acceptanceDate: new Date()
}

console.info(getTestDescription(loanConf))

test('installment amount', function *(t) {
  const result = yield getInstallment(loanConf)
  t.equal(result.installment, 2700)
})

test('sum paid', function *(t) {
  const result = yield getInstallment(loanConf)
    .then(getSumPaid)
  t.equal(result.sumPaid, 162000)
})

test('loan cost', function *(t) {
  const result = yield getInstallment(loanConf)
    .then(getSumPaid)
    .then(getLoanCost)
  t.equal(result.loanCost, 162000-120000)
})

test('loan RPSN', function *(t) {
  const result = yield getInstallment(loanConf)
    .then(getSumPaid)
    .then(getLoanCost)
    .then(getRpsn)
  t.equal(result.rpsn, 13.24)
})

test('installment count', function *(t) {
  const result = yield getInstallment(loanConf)
    .then(getInstallmentCount)
  t.equal(result.term, 60)
})
