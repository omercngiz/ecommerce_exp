import CustomServer from './custom-server.js';
import ProtocolBridge from '../protocol/protocol-bridge.js';

import globalErrorHandler from '../middlewares/global-error-handler.js';
import serverErrorHandler from '../middlewares/server-error-handler.js';
import shutdownHandler from '../middlewares/server-shutdown-handler.js';

const protocolBridge = new ProtocolBridge();

/**
 * TCP Server Instance
 * @type {import("net").Server}
 */
const customServer = new CustomServer(protocolBridge);
globalErrorHandler(customServer);
shutdownHandler(customServer);
serverErrorHandler(customServer);

export default function server() {
    return customServer;
}
