-- Clean up: disable automatic_dial on all paused jobs for consistency
UPDATE "Jobs"
SET automatic_dial = FALSE
WHERE "Processed" = 'No' AND automatic_dial = TRUE;