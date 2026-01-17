# Local Storage Persistence

## Status

Accepted.

## Context

The dashboard is a static site without a backend. It needs simple, offline-friendly
service persistence that works out of the box.

## Decision

Use browser localStorage as the persistence layer. Service data is stored under the
`sdiDashboardProjects` key, with JSON import/export for backup and sharing.

## Consequences

- Data is per-browser and per-device.
- Clearing site data removes the service list.
- Shared persistence would require adding an API and swapping the storage layer.
