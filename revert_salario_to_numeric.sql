-- Revertir la columna 'salario' a tipo DECIMAL.
-- Este script intentará convertir cualquier valor numérico de texto a DECIMAL.
-- Si un valor no es un número válido (ej. 'a convenir'), se establecerá como NULL.
ALTER TABLE ofertas_laborales
ALTER COLUMN salario TYPE DECIMAL(10, 2)
USING CASE
    -- Esta expresión regular verifica si el string contiene solo números y opcionalmente un punto decimal.
    WHEN salario ~ '^[0-9\.]+$' THEN salario::DECIMAL(10, 2)
    ELSE NULL
END;
