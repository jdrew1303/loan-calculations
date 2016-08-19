import test from "tape"
import {getRpsn} from "../src"

test("loanCalculations", (t) => {
  t.plan(1)

  // t.equal(Ocekavana hodnota, volani testovane funkce, popis testu
  t.equal(4, getRpsn(1, 1, 1 , 1), "Calculate loan RPSN")
})
