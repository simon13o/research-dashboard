export function saveLocalJson(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadLocalJson(key){
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}
