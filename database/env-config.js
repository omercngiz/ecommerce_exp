import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

/** EnvConfig class to manage environment variable configurations. */
export default class EnvConfig {
  /**
   * Retrieves and validates the PORT environment variable.
   * Fatal startup errors cause immediate process termination.
   * This entry point does not attempt recovery.
   *
   * @static
   * @throws {Error} - If PORT is not defined.
   * @returns {number} - Parsed PORT number.
   */
  static get_port() {
    let rawPORT = process.env.PORT || "51234";
    if (!rawPORT) {
      throw new Error("PORT is not defined in environment variables.");
    }

    const portNumber = parseInt(rawPORT, 10);
    if (isNaN(portNumber) || portNumber <= 49152 || portNumber > 65535) {
      throw new Error(`Invalid PORT: ${rawPORT}`);
      process.exit(1);
    }
    return portNumber;
  }

  /**
   * Retrieves and validates the TIMEOUT_MS environment variable.
   * Fatal startup errors cause immediate process termination.
   * This entry point does not attempt recovery.
   *
   * @static
   * @throws {Error} - If TIMEOUT_MS is not defined.
   * @returns {number} - Parsed TIMEOUT_MS number.
   */
  static get_timeout_ms() {
    let rawTimeout = process.env.TIMEOUT_MS || "30000";
    const timeoutNumber = parseInt(rawTimeout, 10);
    if (isNaN(timeoutNumber) || timeoutNumber <= 0) {
      throw new Error(`Invalid TIMEOUT_MS: ${rawTimeout}`);
      process.exit(1);
    }
    return timeoutNumber;
  }

  /**
   * Retrieves and validates the MAX_PAYLOAD_SIZE environment variable.
   * Fatal startup errors cause immediate process termination.
   * This entry point does not attempt recovery.
   *
   * @static
   * @throws {Error} - If MAX_PAYLOAD_SIZE is not defined.
   * @returns {number} - Parsed MAX_PAYLOAD_SIZE number.
   */
  static get_max_payload_size() {
    let rawSize = process.env.MAX_PAYLOAD_SIZE || "5242880"; // 5 MB default
    const sizeNumber = parseInt(rawSize, 10);
    if (isNaN(sizeNumber) || sizeNumber <= 0) {
      throw new Error(`Invalid MAX_PAYLOAD_SIZE: ${rawSize}`);
      process.exit(1);
    }
    return sizeNumber;
  }

  /** 
   * Retrieves and validates the MAX_CONNECTIONS environment variable.
   * Fatal startup errors cause immediate process termination.
   * This entry point does not attempt recovery.
   *
   * @static
   * @throws {Error} - If MAX_CONNECTIONS is not defined.
   * @returns {number} - Parsed MAX_CONNECTIONS number.
  */
  static get_max_connections() {
    let rawMaxConn = process.env.MAX_CONNECTIONS || "1000";
    const maxConnNumber = parseInt(rawMaxConn, 10);
    if (isNaN(maxConnNumber) || maxConnNumber <= 0) {
      throw new Error(`Invalid MAX_CONNECTIONS: ${rawMaxConn}`);
      process.exit(1);
    }
    return maxConnNumber;
  }

  /**
   * Retrieves and validates the MIN_LOG_LEVEL environment variable.
   * Fatal startup errors cause immediate process termination.
   * This entry point does not attempt recovery.
   *
   * @static
   * @throws {Error} - If MIN_LOG_LEVEL is invalid.
   * @returns {string} - Validated MIN_LOG_LEVEL string.
   */
  static get_min_log_level() {
    let rawLogLevel = process.env.MIN_LOG_LEVEL || "DEBUG";
    const validLevels = ["DEBUG", "INFO", "WARN", "ERROR"];
    if (!validLevels.includes(rawLogLevel.toUpperCase())) {
      throw new Error(`Invalid MIN_LOG_LEVEL: ${rawLogLevel}`);
      process.exit(1);
    }
    return rawLogLevel.toUpperCase();
  } 

  /**
   * Retrieves and validates the PROTOCOL_VERSION environment variable.
   * Fatal startup errors cause immediate process termination.
   * This entry point does not attempt recovery.
   *
   * @static
   * @throws {Error} - If PROTOCOL_VERSION is not defined or invalid.
   * @returns {number} - Parsed PROTOCOL_VERSION number.
   */
  static get_protocol_version() {
    let rawVersion = process.env.PROTOCOL_VERSION || "1";
    const versionNumber = parseInt(rawVersion, 10);
    if (isNaN(versionNumber) || versionNumber <= 0) {
      throw new Error(`Invalid PROTOCOL_VERSION: ${rawVersion}`);
      process.exit(1);
    }
    return versionNumber;
  }

  /**
   * Retrieves and validates the HEADER_SIZE environment variable.
   * Fatal startup errors cause immediate process termination.
   * This entry point does not attempt recovery.
   *
   * @static
   * @throws {Error} - If HEADER_SIZE is not defined or invalid.
   * @returns {number} - Parsed HEADER_SIZE number.
   */
  static get_header_size() {
    let rawSize = process.env.HEADER_SIZE || "12";
    const sizeNumber = parseInt(rawSize, 10);
    if (isNaN(sizeNumber) || sizeNumber <= 0) {
      throw new Error(`Invalid HEADER_SIZE: ${rawSize}`);
      process.exit(1);
    }
    return sizeNumber;
  }

  /**
   * Retrieves and validates the MIN_MESSAGE_LENGTH environment variable.
   * Fatal startup errors cause immediate process termination.
   * This entry point does not attempt recovery.
   *
   * @static
   * @throws {Error} - If MIN_MESSAGE_LENGTH is not defined or invalid.
   * @returns {number} - Parsed MIN_MESSAGE_LENGTH number.
   */
  static get_min_message_length() {
    let rawLength = process.env.MIN_MESSAGE_LENGTH || "12";
    const lengthNumber = parseInt(rawLength, 10);
    if (isNaN(lengthNumber) || lengthNumber <= 0) {
      throw new Error(`Invalid MIN_MESSAGE_LENGTH: ${rawLength}`);
      process.exit(1);
    }
    return lengthNumber;
  }

  /**
   * Retrieves and validates the MAX_MESSAGE_LENGTH environment variable.
   * Fatal startup errors cause immediate process termination.
   * This entry point does not attempt recovery.
   *
   * @static
   * @throws {Error} - If MAX_MESSAGE_LENGTH is not defined or invalid.
   * @returns {number} - Parsed MAX_MESSAGE_LENGTH number.
   */
  static get_max_message_length() {
    let rawLength = process.env.MAX_MESSAGE_LENGTH || "5242892";
    const lengthNumber = parseInt(rawLength, 10);
    if (isNaN(lengthNumber) || lengthNumber <= 0) {
      throw new Error(`Invalid MAX_MESSAGE_LENGTH: ${rawLength}`);
      process.exit(1);
    }
    return lengthNumber;
  }
}
