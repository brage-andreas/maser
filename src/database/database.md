# PostgreSQL layout
```
maser
└── configs
    └── configs
        ├── id
        ├── bot_log_channel_id
        └── member_log_channel_id
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
    └── configs
```

**Configs**
| Column                  | Type     | Key         |
| ----------------------- | -------- | ----------- |
| `id`                    | `bigint` | `guildId`   |
| `bot_log_channel_id`    | `bigint` | `channelId` |
| `member_log_channel_id` | `bigint` | `channelId` |
