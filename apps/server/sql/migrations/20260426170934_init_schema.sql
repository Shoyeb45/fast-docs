-- +goose Up

-- function to automatic update the table if something is getting updated
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd
-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT NOT NULL,
    github_id INT NOT NULL,
    github_username TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_github_username ON users(github_username);


-- KEYSTORES
CREATE TABLE keystores (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    primary_key TEXT NOT NULL,
    secondary_key TEXT NOT NULL,
    status BOOLEAN DEFAULT TRUE,

    refresh_token TEXT DEFAULT '',
    device_fingerprint TEXT DEFAULT '',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_keystores_user
        FOREIGN KEY (client_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TRIGGER set_updated_at_keystores
BEFORE UPDATE ON keystores
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_keystores_client_id ON keystores(client_id);
CREATE INDEX idx_keystores_client_primary_status ON keystores(client_id, primary_key, status);
CREATE INDEX idx_keystores_client_primary_secondary ON keystores(client_id, primary_key, secondary_key);


-- FOLDERS (self-referencing)
CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name TEXT NOT NULL,
    parent_id INT,
    order_index INT DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_folders_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_folders_parent
        FOREIGN KEY (parent_id)
        REFERENCES folders(id)
        ON DELETE CASCADE
);

CREATE TRIGGER set_updated_at_folders
BEFORE UPDATE ON folders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_user_parent ON folders(user_id, parent_id);


-- DOCS
CREATE TABLE docs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    folder_id INT,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    yjs_state BYTEA,
    order_index INT DEFAULT 0,
    share_token TEXT UNIQUE,
    share_for_all BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_docs_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_docs_folder
        FOREIGN KEY (folder_id)
        REFERENCES folders(id)
        ON DELETE SET NULL
);

CREATE TRIGGER set_updated_at_docs
BEFORE UPDATE ON docs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_docs_user_id ON docs(user_id);
CREATE INDEX idx_docs_user_folder ON docs(user_id, folder_id);
CREATE INDEX idx_docs_share_token ON docs(share_token);


-- DOC SHARES
CREATE TABLE doc_shares (
    id SERIAL PRIMARY KEY,
    doc_id INT NOT NULL,
    user_id INT NOT NULL,
    role TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_docshares_doc
        FOREIGN KEY (doc_id)
        REFERENCES docs(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_docshares_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_doc_user UNIQUE (doc_id, user_id)
);

CREATE TRIGGER set_updated_at_doc_shares
BEFORE UPDATE ON doc_shares
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_docshares_doc_id ON doc_shares(doc_id);
CREATE INDEX idx_docshares_user_id ON doc_shares(user_id);


-- +goose Down

DROP TABLE IF EXISTS doc_shares;
DROP TABLE IF EXISTS docs;
DROP TABLE IF EXISTS folders;
DROP TABLE IF EXISTS keystores;
DROP TABLE IF EXISTS users;