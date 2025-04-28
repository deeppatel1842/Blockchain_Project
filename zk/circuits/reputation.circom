pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template ReputationCheck() {
    signal input rep;
    signal output valid;

    component comp = LessThan(8);
    comp.in[0] <== 50;
    comp.in[1] <== rep;

    valid <== comp.out;
}

component main = ReputationCheck();
