// adds or removes id from array based on enabled option
export async function updateArray(idArray: string[], id: string, enabled: boolean | null): Promise<string[]> {
    // if item is in list and enabled is false, remove it
    if (idArray.includes(id) && !enabled) {
        idArray.splice(idArray.indexOf(id), 1);
        return idArray;
        // if item is not in array and enabled is true, add it
    } else if (!idArray.includes(id) && enabled) {
        return [...idArray, id];
        // otherwise, do nothing
    } else {
        return idArray;
    }
}
