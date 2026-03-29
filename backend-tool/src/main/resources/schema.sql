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

comment on column item.parent_id is 'Identifant de l''item parent';

comment on column item.next_id is 'Identifiant de l''item suivant';

alter table item
    owner to postgres;
