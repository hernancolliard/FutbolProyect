ALTER TABLE usuarios
ADD reset_password_token NVARCHAR(255) NULL,
    reset_password_expires DATETIMEOFFSET NULL;
