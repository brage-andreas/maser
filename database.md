# PostgreSQL layout
<sub>I'm not sure about the instances, to be honest.
It has two IDs, which screams primary key, but that doesn't really make it any more elegant.
Hit me up for any suggestions :D</sub>

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
			├── edited
			├── reason
			├── type
			└── url
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
| `edited`      | `boolean` |
| `type`        | `integer` |
| `url`         | `text`    |
