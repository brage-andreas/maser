<sub>
I have not spent much time and effort with this database setup.
I advise you not to copy this, but to create your own instead, since this quite frankly sucks.
</sub>

<br />

# PostgreSQL layout

```
postgres
└── maser
	└── guilds
		├── configs
		│   ├── guildId
		│   ├── memberLogChannel
		│   ├── botLogChannel
		│   └── modLogChannel
		└── cases-[guild id]
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
	└── cases-[guild id]
```

**configs**
| Column             | Type     |
| ------------------ | -------- |
| `guildId`          | `bigint` |
| `memberLogChannel` | `bigint` |
| `botLogChannel`    | `bigint` |
| `modLogChannel`    | `bigint` |

**cases-[guild id]**
| Column        | Type      |
| ------------- | --------- |
| `caseId`  | `integer` |
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
