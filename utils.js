const usedIds = [];

export function generateId() {
  let newId;
  
  do {
    newId = '_' + Math.random().toString(36).slice(2, 11);
  } while (usedIds.includes(newId));
  
  usedIds.push(newId);
  return newId;
}