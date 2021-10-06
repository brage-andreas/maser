# PostgreSQL layout
```
postgres
└── maser
    └── configs
        ├── logs
        │   ├── id
        │   ├── bot_log_channel_id
        │   └── member_log_channel_id
        └── commands
            ├── id
            └── disabled
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
    ├── logs
    └── commands
```

**logs**
| Column                  | Type     | Key        |
| ----------------------- | -------- | ---------- |
| `id`                    | `bigint` | guild id   |
| `bot_log_channel_id`    | `bigint` | channel id |
| `member_log_channel_id` | `bigint` | channel id |

**commands** (experimental, todo)
| Column    | Type     | Key      |
| --------- | -------- | -------- |
| `id`      | `bigint` | guild id |
| `enabled` | none     | none     |
