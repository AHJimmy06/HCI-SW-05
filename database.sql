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
    order_index INT DEFAULT 0
);

-- 3. Tabla de Participantes
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_plan_id UUID REFERENCES test_plans(id) ON DELETE CASCADE,
    name TEXT,
    profile TEXT
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
    test_plan_id,
    COUNT(id) AS total_observations,
    SUM(CASE WHEN success THEN 1 ELSE 0 END) AS successful_tasks,
    ROUND(AVG(time_seconds), 2) AS avg_time_seconds,
    SUM(errors_count) AS total_errors,
    ROUND((SUM(CASE WHEN success THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(id), 0)) * 100, 2) AS success_rate
FROM observations
GROUP BY test_plan_id;
