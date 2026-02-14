import test from "node:test";
import assert from "node:assert/strict";
import { canStartCTA, shouldQueueStartCTA, transitionCTAState, } from "../src/components/ShowHandCTA/ctaStateMachine.js";
test("CTA state machine transitions through normal lifecycle", () => {
    let state = "entering";
    assert.equal(shouldQueueStartCTA(state), true);
    state = transitionCTAState(state, "ENTER_DONE");
    assert.equal(state, "idle");
    assert.equal(canStartCTA(state), true);
    state = transitionCTAState(state, "START");
    assert.equal(state, "holding");
    state = transitionCTAState(state, "COMPLETE");
    assert.equal(state, "completing");
    state = transitionCTAState(state, "EXIT_DONE");
    assert.equal(state, "hidden");
});
test("CTA ignores invalid transitions", () => {
    let state = "hidden";
    assert.equal(canStartCTA(state), false);
    state = transitionCTAState(state, "START");
    assert.equal(state, "hidden");
    state = transitionCTAState(state, "CANCEL");
    assert.equal(state, "hidden");
    state = transitionCTAState(state, "COMPLETE");
    assert.equal(state, "hidden");
});
