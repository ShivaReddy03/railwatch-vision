
# API Contracts — Dashboard & Alerts (concise)

Deliverable: one file `docs/API_CONTRACTS.md` with the minimal JSON shapes the existing React Query hooks consume. No frontend code changes.

Conventions:
- Base URL: `VITE_API_BASE_URL` • Auth: `Authorization: Bearer <jwt>`
- Timestamps: ISO-8601 UTC • Errors: `{ "detail": "..." }` (FastAPI default)
- Pagination wrapper (reused everywhere):
  ```json
  { "data": [], "total": 0, "page": 1, "pageSize": 10 }
  ```

---

## DASHBOARD (home screen)

### `GET /dashboard/overview` — `useDashboard()`
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
    "imageUrl": "https://cdn.../detection.jpg"
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
- `critical` may be `null` when no active alert.
- `affectedTrains`: up to 5.

### `GET /nodes` — `useNodes()` (track map)
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

---

## ALERTS screen

### `GET /alerts/summary` — `useAlertsSummary()` (4 stat cards)
```json
{ "active": 47, "critical": 8, "warning": 23, "info": 16, "total": 1000 }
```

### `GET /alerts` — `useAlerts(params)` (paginated table)
Query: `page, pageSize, search, severity, status, zone, line`
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
      "imageUrl": "https://cdn.../detection.jpg"
    }
  ],
  "total": 1000, "page": 1, "pageSize": 10
}
```

### `GET /alerts/{id}` — `useAlert(id)` (detail sheet)
Returns one Alert object (same shape as a row above).

### Suggested mutations (UI buttons present, not yet wired)
- `POST /alerts/{id}/acknowledge` → updated Alert
- `POST /alerts/{id}/escalate` body `{ "note": "string" }` → updated Alert
- `GET  /alerts/{id}/export?format=pdf|csv` → file stream

---

## Enums (single source of truth)
- `severity`: `critical | warning | info`
- `alert.status`: `active | acknowledged | resolved`
- `train.status`: `safe | monitor | at_risk | delayed | on_time`
- `node.status`: `normal | warning | critical | offline`
- `confidence`, `riskScore`, `health`: integers 0–100

That's everything backend needs for these two screens.
