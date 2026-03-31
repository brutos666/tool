create table "item" (
    TITLE     varchar(100),
    TEXT      varchar(2000),
    STATE     varchar(15),
    ID        BIGINT AUTO_INCREMENT PRIMARY KEY,
    PARENT_ID integer,
    NEXT_ID   integer
);


