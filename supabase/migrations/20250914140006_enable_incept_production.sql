-- Enable production mode for Incept partner
UPDATE partners 
SET production_enabled = true 
WHERE partner_code = 'INCEPT';
