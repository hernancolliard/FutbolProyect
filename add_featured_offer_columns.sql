ALTER TABLE ofertas_laborales
ADD is_featured BIT DEFAULT 0,
    featured_until DATETIMEOFFSET NULL;