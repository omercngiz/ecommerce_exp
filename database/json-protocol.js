import { StatusMessages } from "./constants.js";
import { generate32BitId } from "./utils.js";

const HEADER_SIZE = 12; // 4 bytes each for messageLength, id, responseTo

export default class JSONProtocol {
  encode = (reqID, response, statusCode) => {
    // Construct response body according to wire protocol
    const responseBody = {
      status: statusCode,
      message: StatusMessages[statusCode],
      payload: {
        value: response
      }
    };

    // Convert body to JSON string and then to Buffer
    const bodyString = JSON.stringify(responseBody);
    const bodyBuffer = Buffer.from(bodyString, 'utf-8');

    // Calculate total message length (header + body)
    const messageLength = HEADER_SIZE + bodyBuffer.length;

    // Generate a unique 32-bit response ID
    const resID = generate32BitId();

    // Create header buffer
    const headerBuffer = Buffer.allocUnsafe(HEADER_SIZE);
    headerBuffer.writeUInt32BE(messageLength, 0);   // messageLength
    headerBuffer.writeUInt32BE(resID, 4);           // id (response id)
    headerBuffer.writeUInt32BE(reqID, 8);           // responseTo (original request id)

    // Combine header and body
    return Buffer.concat([headerBuffer, bodyBuffer]);
  };

  decode = (buffer) => {
    // Parse header (first 12 bytes)
    const messageLength = buffer.readUInt32BE(0);
    const id = buffer.readUInt32BE(4);
    const responseTo = buffer.readUInt32BE(8);

    // Parse body (remaining bytes)
    const bodyBuffer = buffer.subarray(HEADER_SIZE, messageLength);
    const bodyString = bodyBuffer.toString('utf-8');
    const requestBody = JSON.parse(bodyString);

    // Extract request data according to wire protocol
    const op = requestBody.op;
    const ns = requestBody.payload?.ns || null;
    const key = requestBody.payload?.key || null;
    const data = requestBody.payload?.value || null;

    // Return: [request ID, operation, namespace, key, data]
    return [id, op, ns, key, data];
  };
}
