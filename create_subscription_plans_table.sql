CREATE TABLE subscription_plans (
    id INT IDENTITY(1,1) PRIMARY KEY,
    plan_name NVARCHAR(50) NOT NULL UNIQUE,
    price_usd DECIMAL(10, 2) NOT NULL,
    price_mp INT NOT NULL,
    is_active BIT NOT NULL DEFAULT 1
);

INSERT INTO subscription_plans (plan_name, price_usd, price_mp) VALUES ('monthly', 2.00, 200);
INSERT INTO subscription_plans (plan_name, price_usd, price_mp) VALUES ('annual', 12.00, 1200);
