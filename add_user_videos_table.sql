-- add_user_videos_table.sql

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_videos' and xtype='U')
BEGIN
    CREATE TABLE user_videos (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        youtube_url NVARCHAR(500) NOT NULL,
        cover_image_url NVARCHAR(500),
        position INT NOT NULL, -- Para el orden de los videos, de 1 a 5
        created_at DATETIME2 DEFAULT SYSDATETIMEOFFSET(),
        
        CONSTRAINT FK_user_videos_user_id FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        CONSTRAINT UQ_user_videos_user_position UNIQUE (user_id, position) -- Un usuario no puede tener dos videos en la misma posición
    );
    PRINT 'Table user_videos created.';
END
ELSE
BEGIN
    PRINT 'Table user_videos already exists.';
END
GO
