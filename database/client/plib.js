/**
 * Protocol Library - Database Driver
 */

export const encode = (data) => {
  const json = JSON.stringify(data);
  const body = Buffer.from(json, 'utf-8');
  const header = Buffer.from(`${body.length}\n`, 'utf-8');
  
  return Buffer.concat([header, body]);
};

export const decode = (buffer) => {
  const separator = buffer.indexOf('\n');
  const header = buffer.slice(0, separator).toString('utf-8');
  const length = parseInt(header, 10);
  const body = buffer.slice(separator + 1, separator + 1 + length).toString('utf-8');
  
  return JSON.parse(body);
};
