# PostgreSQL layout
```
postgres
└── maser
    └── guilds
        ├── configs
        │   ├── guildId
        │   ├── botLogChannel
        │   ├── memberLogChannel
        │   └── mutedRole
		└── instances-[guild id]
			├── guildId
			├── referenceId
			├── executorTag
			├── executorId
			├── targetTag
			├── timestamp
			├── targetId
			├── duration
			├── reason
			└── type
```

## Databases
```
maser
```

## Schemas
```
maser
└── guilds
```

## Tables
```
maser
└── guilds
    └── configs
```

**configs**
| Column             | Type     |
| ------------------ | -------- |
| `guildId`          | `bigint` |
| `botLogChannel`    | `bigint` |
| `memberLogChannel` | `bigint` |
| `mutedRole`        | `bigint` |

**instances-[guild id]**
| Column        | Type      |
| ------------- | --------- |
| `guildId`     | `bigint`  |
| `referenceId` | `integer` |
| `executorTag` | `text`    |
| `executorId`  | `bigint`  |
| `targetTag`   | `text`    |
| `timestamp`   | `bigint`  |
| `targetId`    | `bigint`  |
| `duration`    | `bigint`  |
| `reason`      | `text`    |
| `type`        | `integer` |