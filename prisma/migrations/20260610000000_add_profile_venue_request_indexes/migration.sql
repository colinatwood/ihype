-- Add index on Profile.ownerId for workbench/profile-management queries
CREATE INDEX IF NOT EXISTS "Profile_ownerId_idx" ON "Profile"("ownerId");

-- Add indexes on VenueConnectionRequest for venue-side and requester-side lookups
CREATE INDEX IF NOT EXISTS "VenueConnectionRequest_venueProfileId_requesterId_idx" ON "VenueConnectionRequest"("venueProfileId", "requesterId");
CREATE INDEX IF NOT EXISTS "VenueConnectionRequest_requesterId_idx" ON "VenueConnectionRequest"("requesterId");
