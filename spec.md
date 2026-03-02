# Specification

## Summary
**Goal:** Perform a clean rebuild and redeploy of the entire application to fix the draft preview hanging on load.

**Planned changes:**
- Force a clean rebuild of both frontend and backend
- Ensure all previously implemented features (monthly snapshots, asset forms, charts, mock rate fetchers) are preserved after the rebuild

**User-visible outcome:** The app loads successfully without hanging or an indefinite spinner, and the dashboard renders correctly after login with all existing features intact.
