use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_groups_table",
            sql: "CREATE TABLE IF NOT EXISTS groups (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                name       TEXT    NOT NULL,
                subject    TEXT,
                grade      TEXT,
                is_deleted INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_students_table",
            sql: "CREATE TABLE IF NOT EXISTS students (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id         INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
                name             TEXT    NOT NULL,
                gender           TEXT,
                birthdate        TEXT,
                student_number   TEXT,
                enrollment_date  TEXT,
                is_deleted       INTEGER NOT NULL DEFAULT 0,
                created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_family_members_table",
            sql: "CREATE TABLE IF NOT EXISTS family_members (
                id                   INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id           INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                name                 TEXT    NOT NULL,
                relationship         TEXT,
                phone                TEXT,
                email                TEXT,
                is_emergency_contact INTEGER NOT NULL DEFAULT 0,
                is_deleted           INTEGER NOT NULL DEFAULT 0,
                created_at           DATETIME DEFAULT CURRENT_TIMESTAMP
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create_student_notes_table",
            sql: "CREATE TABLE IF NOT EXISTS student_notes (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                content    TEXT    NOT NULL,
                is_deleted INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create_schedule_periods_table",
            sql: "CREATE TABLE IF NOT EXISTS schedule_periods (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id    INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
                day_of_week INTEGER NOT NULL,
                name        TEXT    NOT NULL,
                start_time  TEXT    NOT NULL,
                end_time    TEXT    NOT NULL,
                sort_order  INTEGER NOT NULL DEFAULT 0,
                is_deleted  INTEGER NOT NULL DEFAULT 0,
                created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "create_attendance_records_table",
            sql: "CREATE TABLE IF NOT EXISTS attendance_records (
                id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                schedule_period_id INTEGER NOT NULL REFERENCES schedule_periods(id) ON DELETE CASCADE,
                student_id         INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                date               TEXT    NOT NULL,
                status             TEXT    NOT NULL DEFAULT 'present',
                is_deleted         INTEGER NOT NULL DEFAULT 0,
                CONSTRAINT chk_status CHECK (status IN ('present','absent','late','early_pickup')),
                CONSTRAINT uq_attendance UNIQUE (schedule_period_id, student_id, date),
                created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
            );",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:tizara.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
