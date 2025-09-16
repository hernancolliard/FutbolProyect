-- Adding medium and thumbnail versions for the 4 potential offer images.
-- This allows us to store paths to optimized images.

-- Add columns for image 1
ALTER TABLE ofertas_laborales ADD imagen_url_medium NVARCHAR(255) NULL;
ALTER TABLE ofertas_laborales ADD imagen_url_thumb NVARCHAR(255) NULL;

-- Add columns for image 2
ALTER TABLE ofertas_laborales ADD imagen_url_2_medium NVARCHAR(255) NULL;
ALTER TABLE ofertas_laborales ADD imagen_url_2_thumb NVARCHAR(255) NULL;

-- Add columns for image 3
ALTER TABLE ofertas_laborales ADD imagen_url_3_medium NVARCHAR(255) NULL;
ALTER TABLE ofertas_laborales ADD imagen_url_3_thumb NVARCHAR(255) NULL;

-- Add columns for image 4
ALTER TABLE ofertas_laborales ADD imagen_url_4_medium NVARCHAR(255) NULL;
ALTER TABLE ofertas_laborales ADD imagen_url_4_thumb NVARCHAR(255) NULL;
