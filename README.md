# Network Protocol Simulation Project

This project was built to explore and deeply understand how data transfer is achieved and secured in commonly used network protocols. Rather than simply using high-level abstractions, the goal of this project is to demystify the underlying mechanisms of protocol structures by mimicking established engineering patterns.

## 📌 Project Evolution & Architecture

The repository is structured to reflect different stages of learning and architectural approaches:

* **`legacy` Branch:** Contains the first iteration of the project, focusing on initial custom implementations and early concepts of data transfer.
* **`main` Branch (Work in Progress):** Features a redesigned architecture that closely mirrors the official Node.js internal HTTP implementation. 

### Why this approach?
Instead of forcing a custom, arbitrary design, I chose to replicate the structural patterns found in Node.js core libraries. This hands-on approach helps answer not just *how* protocols work, but *why* core engineers designed them in that specific way (e.g., managing streams, handling buffers, and optimizing parsing logic).

## 🚧 Current Status & Future Roadmap

The `main` branch is currently an active work in progress. While the core foundation is laid, certain low-level logic blocks and edge cases within the replicated Node.js HTTP files are still being analyzed and refined. 

Future milestones for this project include:
- [ ] Deep-diving into the exact mechanics of Node.js HTTP state machines and parsing logic.
- [ ] Fully implementing and stabilizing the replicated HTTP structure.
- [ ] Exploring and integrating standard security layers (like TLS/SSL concepts) to understand data protection during transit.

This project serves as a continuous learning sandbox for low-level system design and network programming.
