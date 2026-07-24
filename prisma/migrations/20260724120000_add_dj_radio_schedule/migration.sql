-- Additive, nullable column — no data loss risk, safe to apply directly.
-- Backs DJOnboardingWizard's "Radio schedule" step (weekly/occasional),
-- previously collected in the UI and silently discarded (no field existed).
ALTER TABLE "Profile" ADD COLUMN "radioSchedule" TEXT;
