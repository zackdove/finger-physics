export function transitionCTAState(state, event) {
    switch (event) {
        case "ENTER_DONE":
            return state === "entering" ? "idle" : state;
        case "START":
            if (state === "idle" || state === "holding")
                return "holding";
            return state;
        case "CANCEL":
            if (state === "idle" || state === "holding")
                return "idle";
            return state;
        case "COMPLETE":
            if (state === "idle" || state === "holding")
                return "completing";
            return state;
        case "EXIT_DONE":
            return state === "completing" ? "hidden" : state;
        default:
            return state;
    }
}
export function canStartCTA(state) {
    return state === "entering" || state === "idle" || state === "holding";
}
export function shouldQueueStartCTA(state) {
    return state === "entering";
}
