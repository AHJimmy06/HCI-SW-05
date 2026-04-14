-- Habilitar extensión para IDs aleatorios (si no está habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Planes de Prueba (Contexto General y Cierre)
CREATE TABLE test_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name TEXT NOT NULL,
    module_name TEXT,
    objective TEXT,
    user_profile TEXT,
    method TEXT,
    test_date DATE,
    place_channel TEXT,
    moderator_name TEXT,
    observer_name TEXT,
    tool_prototype TEXT,
    admin_notes TEXT,
    -- Campos de Cierre
    closing_easy TEXT,
    closing_confusing TEXT,
    closing_change TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Tareas
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_plan_id UUID REFERENCES test_plans(id) ON DELETE CASCADE,
    task_label TEXT, -- Ej: "T1", "T2"
    scenario TEXT,
    expected_result TEXT,
    main_metric TEXT,
    success_criteria TEXT,
    follow_up_question TEXT,
    order_index INT DEFAULT 0,
    CONSTRAINT tasks_test_plan_id_task_label_key UNIQUE (test_plan_id, task_label)
);

-- 3. Tabla de Participantes
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_plan_id UUID REFERENCES test_plans(id) ON DELETE CASCADE,
    name TEXT,
    profile TEXT,
    CONSTRAINT participants_test_plan_id_name_key UNIQUE (test_plan_id, name)
);

-- 4. Tabla de Observaciones (Registro de Usabilidad)
CREATE TABLE observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_plan_id UUID REFERENCES test_plans(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    success BOOLEAN DEFAULT FALSE,
    time_seconds INT DEFAULT 0,
    errors_count INT DEFAULT 0,
    key_comments TEXT,
    detected_problem TEXT,
    severity TEXT CHECK (severity IN ('Baja', 'Media', 'Alta', 'Crítica', '')),
    proposed_improvement TEXT
);

-- 5. Tabla de Síntesis de Hallazgos
CREATE TABLE findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_plan_id UUID REFERENCES test_plans(id) ON DELETE CASCADE,
    problem TEXT,
    evidence TEXT,
    frequency TEXT,
    severity TEXT,
    recommendation TEXT,
    priority TEXT CHECK (priority IN ('Baja', 'Media', 'Alta')),
    status TEXT CHECK (status IN ('Pendiente', 'En Progreso', 'Resuelto')) DEFAULT 'Pendiente'
);

-- 6. Vista para el Dashboard (Cálculo automático de KPIs)
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
    tp.id AS test_plan_id,
    (tp.product_name || COALESCE(' : ' || tp.module_name, '')) AS product_name,
    COALESCE(tp.test_date, tp.created_at::date, CURRENT_DATE) AS test_date,
    COUNT(o.id) AS total_observations,
    SUM(CASE WHEN o.success THEN 1 ELSE 0 END) AS successful_tasks,
    ROUND(AVG(o.time_seconds), 2) AS avg_time_seconds,
    SUM(o.errors_count) AS total_errors,
    ROUND((SUM(CASE WHEN o.success THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(o.id), 0)) * 100, 2) AS success_rate
FROM test_plans tp
LEFT JOIN observations o ON tp.id = o.test_plan_id
WHERE tp.deleted_at IS NULL
GROUP BY tp.id, tp.product_name, tp.module_name, tp.test_date, tp.created_at;

--------------------------------------------------------------------------------
-- MODIFICACIONES Y ACTUALIZACIONES (REGISTRO LOG)
--------------------------------------------------------------------------------

-- FECHA: 2026-03-24
-- DESCRIPCIÓN: Implementación de Soft Delete
ALTER TABLE test_plans ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- FECHA: 2026-03-24
-- DESCRIPCIÓN: Soporte para Hotfix v1.0.1 (Optimización de concurrencia y guardado)
-- Nota: Estas restricciones permiten identificar duplicados a nivel de BD para lógica Upsert/Delete-Insert.
ALTER TABLE tasks ADD CONSTRAINT tasks_test_plan_id_task_label_key UNIQUE (test_plan_id, task_label);
ALTER TABLE participants ADD CONSTRAINT participants_test_plan_id_name_key UNIQUE (test_plan_id, name);
