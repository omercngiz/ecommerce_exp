# Simple Wire Protocol (SWP) Specification

**Version:** 1.0.0

**Author:** Ömer Cengiz

**License:** MIT

The **Simple Wire Protocol (SWP)** is a lightweight, socket-based, request-response protocol designed for high-performance communication between clients and database servers over standard TCP/IP sockets.

---

## 1. Transport Layer

Clients must establish a persistent connection to the database server using a regular **TCP/IP socket**. The protocol follows a strict request-response pattern where the server processes requests and returns responses in the order they were received, or asynchronously using unique message identifiers.

---

## 2. Message Structure

Each message consists of a fixed-size **Binary Header** followed by a variable-length **Body**.

### 2.1 Standard Message Header (12 Bytes)

The header is 12 bytes long, composed of three 4-byte (32-bit) integers.

| Offset | Field | Type | Description |
| --- | --- | --- | --- |
| 0 | `messageLength` | int32 | Total message size in bytes (header + body). |
| 4 | `id` | int32 | Unique identifier for this message. |
| 8 | `responseTo` | int32 | The `id` of the original request (used in server responses). |

### 2.2 Message Composition

```json
{
    "header": { "messageLength": 124, "id": 1001, "responseTo": 0 },
    "body": { ... }
}

```

---

## 3. Operations & Body Schema

### 3.1 Request Body

Requests define the operation to be performed and the target data.

**Supported Operations (`op`):** `CREATE`, `READ`, `UPDATE`, `DELETE`

**Schema:**

```json
{
    "op": "STRING",
    "payload": {
        "ns": "NAMESPACE",
        "key": "KEY",
        "value": { "DATA": "OBJECT" }
    }
}

```

### 3.2 Response Body

Every request triggers a response containing a status code and the operation result.

**Schema:**

```json
{
    "status": INTEGER,
    "message": "STRING",
    "payload": { 
        "value": { "DATA": "OBJECT" }
    }
}

```

---

## 4. Status Codes

SWP uses standardized status codes to indicate the outcome of an operation.

| Code | Message | Description |
| --- | --- | --- |
| **100** | `continue` | Request received, please continue. |
| **200** | `ok` | Operation successful. |
| **201** | `created` | Resource successfully created. |
| **202** | `accepted` | Request accepted for processing. |
| **400** | `bad request` | Malformed syntax or invalid data. |
| **404** | `not found` | Key or Namespace does not exist. |
| **408** | `request timeout` | Server timed out waiting for request. |
| **411** | `length required` | `messageLength` is missing or invalid. |
| **413** | `payload too large` | Request body exceeds server limits. |
| **500** | `internal error` | Unexpected server-side error. |
| **501** | `not implemented` | Operation not supported by the server. |
| **503** | `service unavailable` | Server is overloaded or down. |

---

## 5. Implementation Example

To implement a client, the flow should be:

1. Open TCP Socket.
2. Serialize Body to JSON/BSON.
3. Calculate `messageLength` (Body length + 12).
4. Pack Header (Length, ID, 0) into 4-byte buffers.
5. Send Header + Body.
6. Listen for Response Header to determine incoming body size.
