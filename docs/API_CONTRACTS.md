# RailOptic — API Contracts (Dashboard & Alerts)

Minimal JSON shapes the existing React Query hooks consume. Implement these on the FastAPI backend exactly as documented so the frontend works by just setting `VITE_USE_MOCK_DATA=false` and pointing `VITE_API_BASE_URL` to the API.

## Conventions

- **Base URL**: `VITE_API_BASE_URL` (e.g. `https://api.railoptic.example/v1`)
- **Auth**: `Authorization: Bearer <access_token>` on every request
- **Timestamps**: ISO-8601 UTC (`2026-06-28T14:32:11Z`)
- **Errors**: standard HTTP status + `{ "detail": "message" }` (FastAPI default)
- **Pagination wrapper** (reused by every list endpoint):

```json
{ "data": [], "total": 0, "page": 1, "pageSize": 10 }
```

- **Region scoping**: for users with role `section_controller` or `maintenance`, the server MUST filter results by the user's assigned `region` (zone) derived from the JWT. The frontend does not send a region filter for these roles.

---

## 1. Dashboard (Home screen)

### 1.1 `GET /dashboard/overview`
Hook: `useDashboard()` — refetches every 15 s.

```json
{
  "activeAlerts": 47,
  "criticalCount": 8,
  "warningCount": 23,
  "totalNodes": 500,
  "onlineNodes": 478,
  "activeTrains": 312,
  "systemHealth": 98,
  "critical": {
    "id": "ALT-2026-0001",
    "objectCategory": "Rock Detected",
    "line": "North Line",
    "node": "N047",
    "date": "2026-06-28",
    "time": "14:32:11",
    "severity": "critical",
    "status": "active",
    "confidence": 98,
    "riskScore": 92,
    "nearestTrain": "12045",
    "distanceKm": 4.2,
    "etaSec": 360,
    "imageUrl": "https://cdn.example.com/detections/alt-2026-0001.jpg"
  },
  "affectedTrains": [
    {
      "id": "T-1",
      "number": "12045",
      "distanceFromIncidentKm": 4.2,
      "etaMin": 12,
      "status": "at_risk"
    }
  ]
}
```

Notes:
- `critical` MAY be `null` when there is no active alert.
- `affectedTrains`: up to 5 trains nearest the critical incident, sorted ascending by `distanceFromIncidentKm`.
- All counts are integers; `systemHealth` is a 0–100 integer percentage.

### 1.2 `GET /nodes`
Hook: `useNodes()` — used to render the Track Monitoring Overview.

```json
[
  {
    "id": "N001",
    "line": "North Line",
    "gps": { "lat": 17.385, "lng": 78.486 },
    "status": "normal",
    "health": 96
  }
]
```

Returns a plain array (not paginated). Region-scoped per role.

---

## 2. Alerts screen

### 2.1 `GET /alerts/summary`
Hook: `useAlertsSummary()` — drives the four stat cards. Counts active alerts visible to the user; `total` is the all-time total.

```json
{ "active": 47, "critical": 8, "warning": 23, "info": 16, "total": 1000 }
```

### 2.2 `GET /alerts`
Hook: `useAlerts(params)` — paginated table.

**Query parameters**

| name     | type   | example         | notes                                                    |
|----------|--------|-----------------|----------------------------------------------------------|
| page     | int    | `1`             | 1-indexed                                                |
| pageSize | int    | `10`            |                                                          |
| search   | string | `rock`          | matches `id`, `objectCategory`, or `node`                |
| severity | string | `critical`      | `all` \| `critical` \| `warning` \| `info`               |
| status   | string | `active`        | `all` \| `active` \| `acknowledged` \| `resolved`        |
| zone     | string | `South Central` | optional                                                 |
| line     | string | `North Line`    | optional                                                 |

**Response**

```json
{
  "data": [
    {
      "id": "ALT-2026-0001",
      "date": "2026-06-28",
      "time": "14:32:11",
      "zone": "South Central",
      "line": "North Line",
      "node": "N047",
      "objectCategory": "Rock Detected",
      "title": "Rock Detected on North Line",
      "source": "AI Camera",
      "location": "North Line - Node 47",
      "severity": "critical",
      "status": "active",
      "confidence": 98,
      "riskScore": 92,
      "nearestTrain": "12045",
      "distanceKm": 4.2,
      "etaSec": 360,
      "imageUrl": "https://cdn.example.com/detections/alt-2026-0001.jpg"
    }
  ],
  "total": 1000,
  "page": 1,
  "pageSize": 10
}
```

### 2.3 `GET /alerts/{id}`
Hook: `useAlert(id)` — detail side-sheet. Returns one Alert object (same shape as a row in 2.2).

### 2.4 Suggested mutation endpoints (UI buttons present, not yet wired)

- `POST /alerts/{id}/acknowledge` → returns the updated Alert
- `POST /alerts/{id}/escalate` — body `{ "note": "string" }` → returns the updated Alert
- `GET  /alerts/{id}/export?format=pdf|csv` → file stream (`Content-Disposition: attachment`)

---

## 3. Enums (single source of truth)

| Field           | Allowed values                                              |
|-----------------|-------------------------------------------------------------|
| `severity`      | `critical` \| `warning` \| `info`                           |
| `alert.status`  | `active` \| `acknowledged` \| `resolved`                    |
| `train.status`  | `safe` \| `monitor` \| `at_risk` \| `delayed` \| `on_time`  |
| `node.status`   | `normal` \| `warning` \| `critical` \| `offline`            |
| `confidence`, `riskScore`, `health` | integer, 0–100                          |

---

## 4. Auth (referenced by the Axios client)

- `POST /auth/login` — body `{ "username", "password", "role" }` → `{ "access_token", "refresh_token", "user" }`
- `POST /auth/refresh` — body `{ "refresh_token" }` → `{ "access_token", "refresh_token" }`
- `401` on any protected endpoint triggers the refresh flow in the Axios response interceptor.
