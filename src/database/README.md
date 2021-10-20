# PostgreSQL layout
```
postgres
└── maser
    └── configs
        ├── logs
        │   ├── id
        │   ├── bot_log_channel_id
        │   └── member_log_channel_id
        └── roles
            ├── id
            └── muted_role_id
```

## Databases
```
maser
```

## Schemas
```
maser
└── configs
```

## Tables
```
maser
└── configs
    └── guilds
```

**guilds**
| Column                  | Type     | Key        |
| ----------------------- | -------- | ---------- |
| `id`                    | `bigint` | guild id   |
| `bot_log_channel_id`    | `bigint` | channel id |
| `member_log_channel_id` | `bigint` | channel id |
| `muted_role_id`         | `bigint` | role id    |
