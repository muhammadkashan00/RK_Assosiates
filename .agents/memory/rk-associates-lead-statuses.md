---
name: RK Associates Lead statuses
description: Lead.status enum values in the Mongoose model
---

**Why:** Frontend Leads admin uses new/contacted/closed; original model only had initiated/converted which would cause validation errors on status updates.

**How to apply:** Any addition to Lead.status enum must stay backward-compatible with legacy initiated/converted values already stored in MongoDB.

Valid statuses: `["new", "contacted", "closed", "initiated", "converted"]`
Default: `"new"` (leads created after migration)
