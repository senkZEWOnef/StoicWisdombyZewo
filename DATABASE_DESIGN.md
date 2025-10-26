# 🗄️ Eudaimon by Zewo - Database Design

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     USERS       │
│─────────────────│
│ 🔑 id (PK)      │
│ username        │
│ email           │
│ password_hash   │
│ created_at      │
└─────────────────┘
          │
          │ 1:M (One user has many records)
          │
    ┌─────┴─────┬─────────┬─────────┬─────────┬─────────┬─────────┐
    │           │         │         │         │         │         │
    ▼           ▼         ▼         ▼         ▼         ▼         ▼
┌───────────┐ ┌──────────┐ ┌─────────┐ ┌───────────┐ ┌──────────┐ ┌────────────┐
│ JOURNAL   │ │  IDEAS   │ │ POETRY  │ │REMINDERS  │ │ EVENTS   │ │MOOD_ENTRIES│
│ ENTRIES   │ │          │ │         │ │           │ │          │ │            │
│───────────│ │──────────│ │─────────│ │───────────│ │──────────│ │────────────│
│🔑 id (PK) │ │🔑 id(PK) │ │🔑 id(PK)│ │🔑 id (PK) │ │🔑 id(PK) │ │🔑 id (PK)  │
│🔗user_id  │ │🔗user_id │ │🔗user_id│ │🔗user_id  │ │🔗user_id │ │🔗user_id   │
│content    │ │title     │ │title    │ │title      │ │title     │ │mood        │
│created_at │ │content   │ │content  │ │description│ │description│ │energy_level│
│updated_at │ │category  │ │language │ │reminder_  │ │start_time│ │notes       │
└───────────┘ │created_at│ │created_at│ │   date    │ │end_time  │ │stoic_quote │
              └──────────┘ │updated_at│ │completed  │ │event_type│ │entry_type  │
                           └─────────┘ │created_at │ │created_at│ │entry_date  │
                                       └───────────┘ └──────────┘ │one_word_   │
                                                                  │  feeling   │
                                                                  │created_at  │
                                                                  └────────────┘

    ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
    │         │         │         │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼         ▼         ▼         ▼
┌──────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  NOTES   │ │WORKOUTS │ │  MEALS  │ │DAILY_GOALS│ │DAILY_TODOS│ │  BOOKS   │ │POETRY_   │
│          │ │         │ │         │ │          │ │          │ │          │ │ IDEAS    │
│──────────│ │─────────│ │─────────│ │──────────│ │──────────│ │──────────│ │──────────│
│🔑 id(PK) │ │🔑 id(PK)│ │🔑 id(PK)│ │🔑 id(PK) │ │🔑 id(PK) │ │🔑 id(PK) │ │🔑 id(PK) │
│🔗user_id │ │🔗user_id│ │🔗user_id│ │🔗user_id │ │🔗user_id │ │🔗user_id │ │🔗user_id │
│title     │ │name     │ │meal_name│ │goal_date │ │text      │ │title     │ │idea      │
│content   │ │description│ │description│ │calorie_  │ │completed │ │author    │ │inspiration│
│category  │ │target_  │ │calories │ │  goal    │ │date      │ │genre     │ │created_at│
│tags      │ │  date   │ │photo_   │ │water_goal│ │category  │ │description│ └──────────┘
│created_at│ │target_  │ │  path   │ │water_oz  │ │created_at│ │cover_    │
│updated_at│ │  time   │ │meal_time│ │exercise_ │ └──────────┘ │  image   │
└──────────┘ │recurring│ │created_at│ │  goal    │              │status    │
             │  _type  │ └─────────┘ │daily_    │              │rating    │
             │recurring│             │  steps   │              │created_at│
             │  _days  │             │steps_goal│              │updated_at│
             │completed│             │books_read│              └──────────┘
             │completion│             │book_notes│                   │
             │  _date  │             │ideas     │                   │ 1:M
             │duration │             │bible_    │                   │
             │calories_│             │ lectures │                   ▼
             │ burned  │             │recovery_ │              ┌──────────┐
             │notes    │             │  score   │              │BOOK_NOTES│
             │reminder_│             │strain_   │              │          │
             │ enabled │             │  score   │              │──────────│
             │reminder_│             │sleep_    │              │🔑 id(PK) │
             │ minutes │             │  hours   │              │🔗book_id │
             │created_at│             │sleep_    │              │content   │
             └─────────┘             │efficiency│              │image_    │
                  │                  │hrv_score │              │  path    │
                  │ 1:M              │resting_hr│              │created_at│
                  │                  │calories_ │              │updated_at│
                  ▼                  │  out     │              └──────────┘
         ┌────────────────┐          │created_at│
         │WORKOUT_        │          │updated_at│
         │ EXERCISES      │          └──────────┘
         │────────────────│
         │🔑 id (PK)      │
         │🔗workout_id    │
         │exercise_name   │
         │sets            │
         │reps            │
         │weight          │
         │duration        │
         │distance        │
         │notes           │
         │order_index     │
         │created_at      │
         └────────────────┘

┌─────────────────┬─────────────────┬─────────────────┐
│                 │                 │                 │
▼                 ▼                 ▼                 ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│WORKOUT_     │ │WORKOUT_     │ │COMMUNITY_   │ │BODY_        │
│ SESSIONS    │ │ SESSION_    │ │ PHOTOS      │ │ METRICS     │
│             │ │ EXERCISES   │ │             │ │             │
│─────────────│ │─────────────│ │─────────────│ │─────────────│
│🔑 id (PK)   │ │🔑 id (PK)   │ │🔑 id (PK)   │ │🔑 id (PK)   │
│🔗user_id    │ │🔗workout_   │ │🔗user_id    │ │🔗user_id    │
│session_name │ │ session_id  │ │fdc_id       │ │metric_date  │
│workout_date │ │exercise_    │ │image_path   │ │weight       │
│total_       │ │  name       │ │created_at   │ │body_fat_    │
│ duration    │ │exercise_    │ └─────────────┘ │ percentage  │
│total_       │ │ category    │                 │muscle_mass  │
│ calories    │ │primary_     │                 │water_       │
│notes        │ │ muscles     │                 │ percentage  │
│completed    │ │equipment    │                 │bone_mass    │
│completed_at │ │sets         │                 │visceral_fat │
│created_at   │ │reps         │                 │bmr          │
│updated_at   │ │weight       │                 │notes        │
└─────────────┘ │duration     │                 │created_at   │
     │          │distance     │                 │updated_at   │
     │ 1:M      │rest_time    │                 └─────────────┘
     └──────────│calories_    │
                │ burned      │
                │notes        │
                │exercise_    │
                │  data       │
                │created_at   │
                └─────────────┘
```

## 🔗 Table Relationships

### Core User Data
- **users** (1) → **journal_entries** (M)
- **users** (1) → **ideas** (M)
- **users** (1) → **poetry** (M)
- **users** (1) → **poetry_ideas** (M)
- **users** (1) → **notes** (M)

### Scheduling & Planning
- **users** (1) → **reminders** (M)
- **users** (1) → **events** (M)
- **users** (1) → **daily_goals** (M) *[UNIQUE: user_id, goal_date]*
- **users** (1) → **daily_todos** (M)

### Health & Wellness
- **users** (1) → **mood_entries** (M)
- **users** (1) → **meals** (M)
- **users** (1) → **workouts** (M)
- **users** (1) → **workout_sessions** (M)
- **users** (1) → **body_metrics** (M)

### Fitness Tracking
- **workouts** (1) → **workout_exercises** (M) *[CASCADE DELETE]*
- **workout_sessions** (1) → **workout_session_exercises** (M) *[CASCADE DELETE]*

### Learning & Reading
- **users** (1) → **books** (M)
- **books** (1) → **book_notes** (M) *[CASCADE DELETE]*

### Community Features
- **users** (1) → **community_photos** (M)

## 📊 Key Features

### 🔐 Security
- Passwords stored as bcrypt hashes
- JWT token-based authentication
- Foreign key constraints maintain data integrity

### 📱 Performance Optimizations
- **Indexes**: `idx_community_photos_fdc_id` for faster food photo lookups
- **Unique Constraints**: Prevent duplicate daily goals per user/date
- **Cascade Deletes**: Automatically clean up related records

### 🎯 Data Types
- **SERIAL**: Auto-incrementing primary keys
- **VARCHAR**: Text with length limits for performance
- **TEXT**: Unlimited content for journals, notes
- **TIMESTAMP**: Full date/time tracking
- **DATE**: Date-only fields for goals, schedules
- **BOOLEAN**: Simple true/false flags
- **DECIMAL**: Precise numeric data for metrics
- **JSONB**: Structured data for exercise details

### 📈 Tracking Capabilities
- **Daily metrics**: Steps, calories, water, sleep
- **Fitness**: Workouts, exercises, body composition
- **Mental health**: Mood, energy, stoic quotes
- **Productivity**: Goals, todos, reminders
- **Learning**: Books, notes, poetry, ideas

## 🚀 Scalability Considerations
- Partitioning possible on `user_id` for large datasets
- Time-series tables ready for analytics
- JSON fields allow flexible exercise/metric data
- Proper indexing for common query patterns