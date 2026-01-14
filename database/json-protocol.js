export const encode = (data) => {
  try {
    const json = JSON.stringify(data);
    const body = Buffer.from(json, 'utf-8');
    const header = Buffer.from(`${body.length}\n`, 'utf-8');
    
    return Buffer.concat([header, body]);
  } catch (error) {
    throw new Error(`Encode error: ${error.message}`);
  }
};

export const decode = (buffer) => {
  try {
    const separator = buffer.indexOf('\n');
    
    if (separator === -1) {
      throw new Error('Invalid protocol: separator not found');
    }
    
    const header = buffer.slice(0, separator).toString('utf-8');
    const length = parseInt(header, 10);
    
    if (isNaN(length)) {
      throw new Error('Invalid protocol: invalid length');
    }
    
    const body = buffer.slice(separator + 1, separator + 1 + length).toString('utf-8');
    const data = JSON.parse(body);
    
    return data;
  } catch (error) {
    throw new Error(`Decode error: ${error.message}`);
  }
};
