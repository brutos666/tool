CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name    TEXT NOT NULL,   -- Prénom
    last_name     TEXT NOT NULL,   -- Nom
    password      TEXT NOT NULL,   -- Mot de passe (hash)
    email         TEXT NOT NULL UNIQUE,  -- Adresse e-mail
    role          TEXT NOT NULL,   -- Rôle
    token         TEXT,            -- Jeton de connexion
    refresh_token TEXT,            -- Jeton de rafraîchissement
    created_at    TEXT DEFAULT CURRENT_TIMESTAMP,  -- Date de création
    updated_at    TEXT DEFAULT CURRENT_TIMESTAMP   -- Date de mise à jour
);

CREATE TRIGGER IF NOT EXISTS users_set_updated_at
AFTER UPDATE ON users
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS item (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,  -- Identifiant unique
    title     TEXT,    -- Titre (max 100)
    text      TEXT,    -- Description (max 2000)
    state     TEXT,    -- Etat (max 15)
    parent_id INTEGER, -- Item parent
    next_id   INTEGER -- Item suivant
);

CREATE INDEX IF NOT EXISTS idx_item_parent ON item(parent_id);