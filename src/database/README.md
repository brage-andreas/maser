# PostgreSQL layout
I'm not sure about the instances, to be honest.
It has two ids, which screams primary key, but that doesn't relly make it any more elegant.

```
postgres
└── maser
    └── guilds
        ├── configs
        │   ├── guildId
        │   ├── memberLogChannel
        │   ├── botLogChannel
		│   ├── modLogChannel
        │   └── mutedRole
		└── instances-[guild id]
            ├── istanceId
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
	├── configs
    └── instances-[guild id]
```

**configs**
| Column             | Type     |
| ------------------ | -------- |
| `guildId`          | `bigint` |
| `memberLogChannel` | `bigint` |
| `botLogChannel`    | `bigint` |
| `modLogChannel`    | `bigint` |
| `mutedRole`        | `bigint` |

**instances-[guild id]**
| Column        | Type      |
| ------------- | --------- |
| `instanceId`  | `integer` |
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