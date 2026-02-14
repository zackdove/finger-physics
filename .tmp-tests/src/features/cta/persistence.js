export function resolvePersistHandCTA(queryPersistValue, envPersistValue) {
    const envPersistEnabled = String(envPersistValue ?? "true") === "true";
    if (queryPersistValue === "0")
        return false;
    if (queryPersistValue === "1")
        return true;
    return envPersistEnabled;
}
export function getInitialHasShownHandCTA(persistHandCTA, storage, key) {
    if (!persistHandCTA || !storage)
        return false;
    return storage.getItem(key) === "1";
}
