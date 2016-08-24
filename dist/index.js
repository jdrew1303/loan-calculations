'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getSumPaid = getSumPaid;
exports.getLoanCost = getLoanCost;
exports.getInstallment = getInstallment;
exports.getRpsn = getRpsn;
exports.getInstallmentCount = getInstallmentCount;

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// ------------------------------------------------------------------------------------------------
// Helper methods

/**
 * Converts milliseconds to days
 * @param time {number} Time in milliseconds
 * @returns {number}
 */
function millisecondsToDays(time) {
  return Math.round(time / (1000 * 60 * 60 * 24));
}

/**
 * Calculates a product of array of numbers
 * @param arrayOfNumbers  Array of numbers
 * @returns {number}
 */
function product(arrayOfNumbers) {
  return arrayOfNumbers.reduce(function (n, r) {
    return n * r;
  }, 1);
}

/**
 * Calculates a sum of array of numbers
 * @param arrayOfNumbers  Array of numbers
 * @returns {number}
 */
function sum(arrayOfNumbers) {
  return arrayOfNumbers.reduce(function (n, r) {
    return n + r;
  }, 0);
}

/**
 * Number of days in month of specified installment payment (ignores payment date)
 * @param loan {Object} Loan object
 *    @property acceptanceDate {Date} Loan start date
 * @param i {number} Installment number
 * @returns {number}
 */
function getDaysInInstallmentMonth(_ref, i) {
  var acceptanceDate = _ref.acceptanceDate;

  return new Date(acceptanceDate.getFullYear(), acceptanceDate.getMonth() + i + 1, 0).getDate();
}

/**
 * Get days in period for specified installment payment (doesn't ignore payment date)
 * @param loan {Object} Loan object
 *    @property defaultPayDay {number} Default installment payment day
 *    @property acceptanceDate {Date} Loan start date
 * @param i {number} Installment number
 * @returns {number}
 */
function getDaysInInstallmentPeriod(_ref2, i) {
  var defaultPayDay = _ref2.defaultPayDay;
  var acceptanceDate = _ref2.acceptanceDate;

  var payDay = getInstallmentPaymentDay(defaultPayDay, getDaysInInstallmentMonth(acceptanceDate, i));
  return millisecondsToDays(getInstallmentPaymentDate(acceptanceDate, payDay, i).valueOf() - getInstallmentPaymentDate(acceptanceDate, payDay, i - 1).valueOf());
}

/**
 * Proper installment pay day for remaining month length
 *    @property defaultPayDay {number} Default installment payment day
 * @param daysInInstallmentMonth {number} Number of days in installment month
 * @returns {number}
 */
function getInstallmentPaymentDay(_ref3, daysInInstallmentMonth) {
  var defaultPayDay = _ref3.defaultPayDay;

  return defaultPayDay > daysInInstallmentMonth ? daysInInstallmentMonth : defaultPayDay;
}

/**
 * Get installment date
 * @param loan {Object} Loan object
 *    @property acceptanceDate {Date} Loan acceptance date
 * @param payDay {number} Proper installment payday
 * @param i {number} Installment num
 * @returns {Date}
 */
function getInstallmentPaymentDate(_ref4, payDay, i) {
  var acceptanceDate = _ref4.acceptanceDate;

  if (i < 1) return acceptanceDate;
  var resultDate = getInstallmentPaymentDate(acceptanceDate, payDay, i - 1);
  return new Date(resultDate.getFullYear(), resultDate.getMonth() + 1, payDay);
}

/**
 * Get days from acceptance date
 * @param loan {Object} Loan object
 *    @property defaultPayDay {number} Default installment payment day
 *    @property acceptanceDate {Date} Loan acceptance date
 * @param i {number} Installment num
 * @returns {number}
 */
function getDaysFromAcceptance(_ref5, i) {
  var defaultPayDay = _ref5.defaultPayDay;
  var acceptanceDate = _ref5.acceptanceDate;

  return i < 1 ? 0 : getDaysInInstallmentPeriod(defaultPayDay, acceptanceDate, i) + getDaysFromAcceptance(defaultPayDay, acceptanceDate, i - 1);
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
function getSumPaid(_ref6) {
  var installment = _ref6.installment;
  var term = _ref6.term;

  var rest = _objectWithoutProperties(_ref6, ['installment', 'term']);

  return new Promise(function (resolve) {
    if (!installment || !term) throw new Error('Installment amount and term must be defined');
    var sumPaid = installment * term;
    resolve(_extends({
      installment: installment,
      term: term,
      sumPaid: sumPaid }, rest));
  });
}

/**
 * Get trivial loan cost (sum overpaid)
 * @param loan {Object} Loan object
 *    @property amount {number} Loan amount
 *    @property sumPaid {number} Installments sum
 * @returns {Promise}
 */
function getLoanCost(_ref7) {
  var amount = _ref7.amount;
  var sumPaid = _ref7.sumPaid;

  var rest = _objectWithoutProperties(_ref7, ['amount', 'sumPaid']);

  return new Promise(function (resolve) {
    if (!amount || !sumPaid) throw new Error('Loan amount and sum paid must be defined');
    var loanCost = sumPaid - amount;
    resolve(_extends({
      amount: amount,
      sumPaid: sumPaid,
      loanCost: loanCost }, rest));
  });
}

/**
 * Single installment value
 * @param loan {Object} Loan object
 *    @property amount {number} Loan amount
 *    @property interestRate {number} Loan interest rate
 *    @property term {number} Number on installments (monthly payments)
 * @returns {Promise}
 */
function getInstallment(_ref8) {
  var amount = _ref8.amount;
  var interestRate = _ref8.interestRate;
  var term = _ref8.term;

  var rest = _objectWithoutProperties(_ref8, ['amount', 'interestRate', 'term']);

  return new Promise(function (resolve) {
    if (!amount || !interestRate || !term) throw new Error('Loan amount, interest rate and term must be defined');
    var installment = Math.round(amount * (interestRate / 12 / (1 - Math.pow(1 + interestRate / 12, -(term / 12) * 12))));
    resolve(_extends({
      amount: amount,
      interestRate: interestRate,
      term: term,
      installment: installment }, rest));
  });
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
function getRpsn(_ref9) {
  var amount = _ref9.amount;
  var term = _ref9.term;
  var interestRate = _ref9.interestRate;
  var _ref9$costs = _ref9.costs;
  var costs = _ref9$costs === undefined ? 0 : _ref9$costs;

  var rest = _objectWithoutProperties(_ref9, ['amount', 'term', 'interestRate', 'costs']);

  return new Promise(function (resolve) {
    var monthlyRate = interestRate / 12; // @FIXME tohle je jádro pudla, měsíční sazba není úrok / 12, protože intervaly splátek nejsou stejně dlouhé
    var totalMonthPayment = (amount + costs) * monthlyRate * Math.pow(1 + monthlyRate, term) / (Math.pow(1 + monthlyRate, term) - 1);
    var testRate = monthlyRate;
    var iteration = 1;
    var testResult = 0;
    // iterate until result = 0
    var testDiff = testRate;
    while (iteration <= 100) {
      testResult = testRate * Math.pow(1 + testRate, term) / (Math.pow(1 + testRate, term) - 1) - totalMonthPayment / amount;
      if (Math.abs(testResult) < 0.0000001) break;
      if (testResult < 0) testRate += testDiff;else testRate -= testDiff;
      testDiff = testDiff / 2;
      iteration++;
    }
    testRate = testRate * 12;
    var rpsn = Math.round(testRate * 10000) / 100;
    resolve(_extends({
      rpsn: rpsn,
      amount: amount,
      term: term,
      interestRate: interestRate,
      costs: costs
    }, rest));
  });
}

/**
 * Calculates number of installments in loan
 * @param loan {Object} Loan object
 *    @property amount {number} Loan amount
 *    @property installment {number} Installment amount
 *    @property interestRate {number} Loan interest rate
 * @return {Promise}
 */
function getInstallmentCount(_ref10) {
  var amount = _ref10.amount;
  var installment = _ref10.installment;
  var interestRate = _ref10.interestRate;

  var rest = _objectWithoutProperties(_ref10, ['amount', 'installment', 'interestRate']);

  return new Promise(function (resolve) {
    if (!amount || !installment || !interestRate) throw new Error('Loan amount, installment amount and interest rate are required');
    var term;
    if (interestRate == 0) {
      term = Math.ceil(amount / installment);
    } else {
      term = Math.ceil(round(Math.log(interestRate * amount / (A * (1 + interestRate)) + 1) / Math.log(1 + interestRate), 4));
      if (term > 0) {
        var c = round(A * ((1 + interestRate) * (Math.pow(1 + interestRate, term) - 1) / interestRate), 2);
        if (c > amount) {
          c = amount - A * ((1 + interestRate) * (Math.pow(1 + interestRate, term - 1) - 1) / interestRate);
          term = (term - 1) * 12 + Math.ceil(c / installment);
        } else term = term * 12;
      } else term = 0;
    }
    resolve(_extends({
      term: term,
      amount: amount,
      installment: installment,
      interestRate: interestRate }, rest));
  });
}