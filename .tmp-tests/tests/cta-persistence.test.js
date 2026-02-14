import test from "node:test";
import assert from "node:assert/strict";
import { getInitialHasShownHandCTA, resolvePersistHandCTA, } from "../src/features/cta/persistence.js";
test("query param overrides env for CTA persistence", () => {
    assert.equal(resolvePersistHandCTA("0", "true"), false);
    assert.equal(resolvePersistHandCTA("1", "false"), true);
    assert.equal(resolvePersistHandCTA(null, "false"), false);
    assert.equal(resolvePersistHandCTA(null, undefined), true);
});
test("initial CTA shown state respects persistence and storage", () => {
    const storage = {
        getItem: (key) => (key === "hand_cta_shown" ? "1" : null),
    };
    assert.equal(getInitialHasShownHandCTA(true, storage, "hand_cta_shown"), true);
    assert.equal(getInitialHasShownHandCTA(false, storage, "hand_cta_shown"), false);
    assert.equal(getInitialHasShownHandCTA(true, null, "hand_cta_shown"), false);
});
