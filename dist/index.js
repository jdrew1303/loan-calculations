'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSumPaid = getSumPaid;
exports.getInstallment = getInstallment;
exports.getRpsn = getRpsn;
/*
 * general helper functions
 */

var copyDate = function copyDate(date) {
  return new Date(date.getTime());
};

// 2016-11-30T23:55:55 -> 2016-11-30T00:00:00
var stripTime = function stripTime(date) {
  var copy = copyDate(date);
  copy.setUTCHours(0, 0, 0, 0, 0);
  return copy;
};

// 2016-11-30 -> 2016-12-30
// 2016-12-30 -> 2017-01-30
var incrementMonth = function incrementMonth(date) {
  var copy = copyDate(date);
  if (copy.getUTCMonth() === 11) {
    copy.setUTCFullYear(copy.getUTCFullYear() + 1);
    copy.setUTCMonth(0);
  } else {
    copy.setUTCMonth(copy.getUTCMonth() + 1);
  }
  return copy;
};

// 2016-11-30, 2016-12-01 -> 1
var dayDifference = function dayDifference(d1, d2) {
  var milliseconds = stripTime(d2) - stripTime(d1);
  return Math.round(milliseconds / (1000 * 60 * 60 * 24));
};

// https://github.com/mikolalysenko/bisect/blob/master/bisect.js
// Supposing that predicate is monotone over the interval [lo,hi), finds the
// first occurence of where predicate is true up to a resolution of tolerance.
var bisect = function bisect(pred, lo, hi, tol) {
  tol = tol || 1e-8;
  while (hi - lo > tol) {
    // console.log(lo, hi)  // uncomment this to see the convergence rate
    var m = (hi + lo) / 2;
    pred(m) ? hi = m : lo = m;
  }
  return lo;
};

// 0.17788346856832504 -> 17.79
var round2 = function round2(float) {
  return Math.round(float * 100) / 100;
};

/*
 * business logic
 */

// 2016-11-06 -> 2016-12-05
// 2016-12-01 -> 2017-01-05
var nextInstallmentDate = function nextInstallmentDate(date, installment_day) {
  var d = incrementMonth(date);
  d.setUTCDate(installment_day);
  return d;
};

// this implements the calculation inside the RPSN sum definition
var contribution = function contribution(monthly, rpsn) {
  return function (fraction) {
    return monthly * Math.pow(1 + rpsn, -1 * fraction);
  };
};

/**
 * Calculates a sum of array of numbers
 * @param arrayOfNumbers  Array of numbers
 * @returns {number}
 */
var sum = function sum(arrayOfNumbers) {
  return arrayOfNumbers.reduce(function (n, r) {
    return n + r;
  }, 0);
};

/**
 * Calculates total amount paid
 * @param term {number} Number of installments
 * @param monthly {number} Monthly payment
 * @param date {Date} Acceptance date
 * @param installmentDay {number} Day in month of installment payment
 */
var getTotal = function getTotal(term, monthly, date, installmentDay) {
  return function (rpsn) {
    // first, we need a list of installment dates
    var dates = [copyDate(date)];
    for (var i = 1; i <= term; i++) {
      dates[i] = nextInstallmentDate(dates[i - 1], installmentDay);
    }
    dates.shift(); // drop the acceptance date

    // now, let's convert those into the number of days into the future
    var fractions = dates.map(function (d) {
      return dayDifference(date, d) / 365.25;
    });

    // from these, calculate a list of monthly contributions to the total
    return sum(fractions.map(contribution(monthly, rpsn)));
  };
};

// ------------------------------------------------------------------------------------------------
// Exported interface

/**
 * Calculates total amount paid
 * @param term {number} Number of installments
 * @param monthly {number} Monthly payment
 * @param date {Date} Acceptance date
 * @param installmentDay {number} Day in month of installment payment
 */
function getSumPaid(term, monthly, date, installmentDay) {
  return getTotal(term, monthly, date, installmentDay)(0);
}

/**
 * Single installment value
 * @param amount {number} Loan amount
 * @param interestRate {number} Loan interest rate
 * @param term {number} Number on installments (monthly payments)
 * @param roundingFn {Function} Rounding function
 * @returns {Promise}
 */
function getInstallment(amount, interestRate, term) {
  var roundingFn = arguments.length <= 3 || arguments[3] === undefined ? function (i) {
    return i;
  } : arguments[3];

  if (!amount || !interestRate || !term) throw new Error('Loan amount, interest rate and term must be defined');
  return roundingFn(amount * (interestRate / 12 / (1 - Math.pow(1 + interestRate / 12, -(term / 12) * 12))));
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
function getRpsn(amount, term, monthly, date, installmentDay) {
  var total = getTotal(term, monthly, stripTime(date), installmentDay);
  var predicate = function predicate(x) {
    return total(x) - amount < 0;
  };
  return round2(100 * bisect(predicate, 0, 10));
}