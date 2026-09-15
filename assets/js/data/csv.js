export function parseCsv(text){
  const lines = text.split(/\r?\n/).filter(x => x.trim());
  if(lines.length < 2) return [];
  const split = line => {
    const out=[];
    let current="";
    let quoted=false;
    for(let i=0;i<line.length;i++){
      const char=line[i];
      if(char === '"'){
        if(quoted && line[i+1] === '"'){ current+='"'; i++; }
        else quoted=!quoted;
      } else if(char === "," && !quoted){
        out.push(current);
        current="";
      } else {
        current += char;
      }
    }
    out.push(current);
    return out.map(value => value.trim());
  };
  const headers = split(lines[0]).map(header => header.toLowerCase().replace(/\s+/g,"_"));
  return lines.slice(1).map(split).map(values => {
    const row = {};
    headers.forEach((header,index) => { row[header] = values[index] ?? ""; });
    return row;
  });
}
