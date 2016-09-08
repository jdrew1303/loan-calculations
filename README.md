# loan-calculations

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Downloads][download-badge]][npm-url]

> Module for providing loan and interest calculations.

## Install

```sh
npm i loan-calculations
```

## API

## Functions

<dl>
<dt><a href="#getSumPaid">getSumPaid(term, monthly, date, installmentDay)</a></dt>
<dd><p>Calculates total amount paid</p>
</dd>
<dt><a href="#getInstallment">getInstallment(amount, interestRate, term, roundingFn)</a> ⇒ <code>Promise</code></dt>
<dd><p>Single installment value</p>
</dd>
<dt><a href="#getRpsn">getRpsn(amount, term, monthly, date, installmentDay)</a></dt>
<dd><p>Calculates loan yearly percentage rate</p>
</dd>
</dl>

<a name="getSumPaid"></a>

## getSumPaid(term, monthly, date, installmentDay)
Calculates total amount paid

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| term | <code>number</code> | Number of installments |
| monthly | <code>number</code> | Monthly payment |
| date | <code>Date</code> | Acceptance date |
| installmentDay | <code>number</code> | Day in month of installment payment |

<a name="getInstallment"></a>

## getInstallment(amount, interestRate, term, roundingFn) ⇒ <code>Promise</code>
Single installment value

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> | Loan amount |
| interestRate | <code>number</code> | Loan interest rate |
| term | <code>number</code> | Number on installments (monthly payments) |
| roundingFn | <code>function</code> | Rounding function |

<a name="getRpsn"></a>

## getRpsn(amount, term, monthly, date, installmentDay)
Calculates loan yearly percentage rate

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> | Loan amount |
| term | <code>number</code> | Number of installments |
| monthly | <code>number</code> | Monthly payment |
| date | <code>Date</code> | Acceptance date |
| installmentDay | <code>number</code> | Day in month of installment payment |

**Example**  
```js
getRpsn(120000, 60, 2700, new Date('2016-07-05'), 5)
```

## Author

- Viktor Bezdek (@viktorbezdek)
- Petr Certik (@czert)

## License

MIT © [SiteOne](http://github.com/siteone)

[npm-url]: https://npmjs.org/package/loan-calculations
[npm-image]: https://img.shields.io/npm/v/loan-calculations.svg?style=flat-square

[travis-url]: https://travis-ci.org/ViktorBezdek/loan-calculations
[travis-image]: https://img.shields.io/travis/ViktorBezdek/loan-calculations.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/ViktorBezdek/loan-calculations
[coveralls-image]: https://img.shields.io/coveralls/ViktorBezdek/loan-calculations.svg?style=flat-square

[depstat-url]: https://david-dm.org/ViktorBezdek/loan-calculations
[depstat-image]: https://david-dm.org/ViktorBezdek/loan-calculations.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/loan-calculations.svg?style=flat-square
