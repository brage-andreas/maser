# PostgreSQL layout
```
maser
└── configs
    ├── logs
    │   ├── id
    │   ├── bot_log_channel_id
    │   └── member_log_channel_id
    ├── commands
    │   ├── id
    │   └── disabled
    └── roles
        ├── id
        ├── mod
        └── admin
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
    ├── commands
    └── roles
```

**logs**
| Column                  | Type     | Key        |
| ----------------------- | -------- | ---------- |
| `id`                    | `bigint` | guild id   |
| `bot_log_channel_id`    | `bigint` | channel id |
| `member_log_channel_id` | `bigint` | channel id |

**commands** (experimental)
| Column    | Type     | Key      |
| --------- | -------- | -------- |
| `id`      | `bigint` | guild id |
| `enabled` | none     | none     |

**roles** (TODO)
| Column    | Type     | Key           |
| --------- | -------- | ------------- |
| `id`      | `bigint` | guild id      |
| `mod`     | `bigint` | mod role id   |
| `admin`   | `bigint` | admin role id |
