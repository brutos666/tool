create sequence if not exists user_id_seq START 1;
create table if not exists users
(
    id          bigint primary key default nextval('user_id_seq'::regclass) not null,
    first_name  VARCHAR NOT NULL,
    last_name   VARCHAR NOT NULL,
    password    VARCHAR NOT NULL,
    email       VARCHAR UNIQUE NOT NULL,
    role        VARCHAR NOT NULL,
    token       VARCHAR,
    refresh_token VARCHAR,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
comment on table users is 'Utilisateur';
comment on column users.first_name is 'Prénom';
comment on column users.last_name is 'Nom';
comment on column users.password is 'Mot de passe';
comment on column users.email is 'Adresse e-mail';
comment on column users.role is 'Rôle';
comment on column users.token is 'Jeton de connexion';
comment on column users.refresh_token is 'Jeton de rafraîchissement';
comment on column users.created_at is 'Date de création';
comment on column users.update_at is 'Date de mise à jour';

comment on table item is 'Item';
comment on column item.title is 'Titre';
comment on column item.text is 'Description';
comment on column item.state is 'Etat';
comment on column item.id is 'Identifiant unique';
comment on column item.parent_id is 'Identifiant de l''item parent';
comment on column item.next_id is 'Identifiant de l''item suivant';
alter table users
    owner to postgres;

create sequence if not exists item_id_seq START 1;

create table if not exists item
(
    title     varchar(100),
    text      varchar(2000),
    state     varchar(15),
    id        bigint primary key default nextval('item_id_seq'::regclass) not null,
    parent_id integer,
    next_id   integer
);

comment on table item is 'Item';
comment on column item.title is 'Titre';
comment on column item.text is 'Description';
comment on column item.state is 'Etat';
comment on column item.id is 'Identifiant unique';
comment on column item.parent_id is 'Identifiant de l''item parent';
comment on column item.next_id is 'Identifiant de l''item suivant';

alter table item
    owner to postgres;
