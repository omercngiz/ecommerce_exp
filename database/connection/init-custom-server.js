
import Server from './custom-server.js';
import ProtocolBridge from '../protocol/protocol-bridge.js';


import globalErrorHandler from '../middlewares/global-error-handler.js';
import serverErrorHandler from '../middlewares/server-error-handler.js';
import shutdownHandler from '../middlewares/server-shutdown-handler.js';

const protocolBridge = new ProtocolBridge();

/**
 * TCP Server Instance
 * @type {import("net").Server}
 */
const server = new Server(protocolBridge)
globalErrorHandler(server);
shutdownHandler(server);
serverErrorHandler(server);

export default server;
