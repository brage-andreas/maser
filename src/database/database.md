# PostgreSQL layout
```
maser
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
| Column                  | Type     | Key         |
| ----------------------- | -------- | ----------- |
| `id`                    | `bigint` | `guildId`   |
| `bot_log_channel_id`    | `bigint` | `channelId` |
| `member_log_channel_id` | `bigint` | `channelId` |

**commands** (experimental)
| Column    | Type     | Key         |
| --------- | -------- | ----------- |
| `id`      | `bigint` | `guildId`   |
| `enabled` | none     | none        |
