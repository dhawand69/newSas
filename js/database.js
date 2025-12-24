
database-supabase.js
// database.js - Supabase Database Functions
// Replaces IndexedDB with Supabase

async function initDB() {
  try {
    await initSupabase();
    console.log("✅ Supabase initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Supabase initialization failed:", error);
    showToast("Database connection failed", "error");
    return false;
  }
}

// ===== STUDENT OPERATIONS =====
async function addRecord(table, data) {
  try {
    const { data: result, error } = await supabaseClient
      .from(table)
      .insert([data])
      .select();

    if (error) throw error;
    return result[0]?.id || result[0];
  } catch (error) {
    console.error(`❌ Error adding to ${table}:`, error);
    showToast(`Error adding record: ${error.message}`, "error");
    throw error;
  }
}

async function updateRecord(table, data) {
  try {
    const { error } = await supabaseClient
      .from(table)
      .update(data)
      .eq("id", data.id);

    if (error) throw error;
    showToast("Record updated successfully", "success");
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${table}:`, error);
    showToast(`Error updating record: ${error.message}`, "error");
    throw error;
  }
}

async function getAll(table) {
  try {
    const { data, error } = await supabaseClient
      .from(table)
      .select("*");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`❌ Error fetching from ${table}:`, error);
    return [];
  }
}

async function getRecord(table, id) {
  try {
    const { data, error } = await supabaseClient
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`❌ Error getting record from ${table}:`, error);
    return null;
  }
}

async function deleteRecord(table, id) {
  try {
    const { error } = await supabaseClient
      .from(table)
      .delete()
      .eq("id", id);

    if (error) throw error;
    showToast("Record deleted successfully", "success");
    return true;
  } catch (error) {
    console.error(`❌ Error deleting from ${table}:`, error);
    showToast(`Error deleting record: ${error.message}`, "error");
    throw error;
  }
}

async function clearStore(table) {
  try {
    const { error } = await supabaseClient
      .from(table)
      .delete()
      .neq("id", ""); // Delete all records

    if (error) throw error;
    showToast(`${table} cleared successfully`, "success");
    return true;
  } catch (error) {
    console.error(`❌ Error clearing ${table}:`, error);
    return false;
  }
}

// ===== CLASS OPERATIONS =====
async function deleteClass(id) {
  showConfirm("Delete this class?", async function () {
    try {
      await deleteRecord("classes", id);
      loadClasses();
      loadFaculty();
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  });
}

// ===== YEAR OPERATIONS =====
async function deleteYear(id) {
  showConfirm("Delete this academic year?", async function () {
    try {
      await deleteRecord("academic_years", id);
      loadYears();
    } catch (error) {
      console.error("Error deleting year:", error);
    }
  });
}

// ===== STUDENT DASHBOARD =====
async function populateStudentDashboard(student) {
  document.getElementById(
    "studentNameDisplay"
  ).textContent = `${student.first_name || ""} ${student.last_name || ""}`;
  document.getElementById(
    "studentRollDisplay"
  ).textContent = `Roll No: ${student.roll_no}`;
  document.getElementById("studentEmailDisplay").textContent =
    student.email || "N/A";
  document.getElementById("studentDeptDisplay").textContent =
    student.department || "N/A";
  document.getElementById("studentSemDisplay").textContent = student.semester || "N/A";
  document.getElementById("studentYearDisplay").textContent = student.year || "N/A";
  
  await loadStudentStats(student.id);
}

// ===== ATTENDANCE OPERATIONS =====
async function loadAttendance(classId, date = null) {
  try {
    let query = supabaseClient
      .from("attendance")
      .select("*")
      .eq("class_id", classId);

    if (date) {
      query = query.eq("date", date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error loading attendance:", error);
    return [];
  }
}

async function markAttendance(classId, studentId, status, date) {
  try {
    // Check if record exists
    const { data: existing } = await supabaseClient
      .from("attendance")
      .select("id")
      .eq("class_id", classId)
      .eq("student_id", studentId)
      .eq("date", date)
      .single();

    if (existing) {
      // Update existing record
      await supabaseClient
        .from("attendance")
        .update({ status, updated_at: new Date() })
        .eq("id", existing.id);
    } else {
      // Create new record
      await supabaseClient.from("attendance").insert({
        class_id: classId,
        student_id: studentId,
        date,
        status,
        created_at: new Date(),
      });
    }

    showToast("Attendance marked successfully", "success");
    return true;
  } catch (error) {
    console.error("Error marking attendance:", error);
    showToast("Error marking attendance", "error");
    return false;
  }
}

// ===== STATISTICS =====
async function loadStudentStats(studentId) {
  try {
    // Get total classes attended
    const { data: attendanceData, error } = await supabaseClient
      .from("attendance")
      .select("status")
      .eq("student_id", studentId);

    if (error) throw error;

    const total = attendanceData?.length || 0;
    const present = attendanceData?.filter(a => a.status === "present").length || 0;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    document.getElementById("studentTotalClasses").textContent = total;
    document.getElementById("studentAttendancePercent").textContent = `${percentage}%`;
    document.getElementById("studentClassesPresent").textContent = present;

    return { total, present, percentage };
  } catch (error) {
    console.error("Error loading student stats:", error);
    return { total: 0, present: 0, percentage: 0 };
  }
}

// ===== FILTER AND SEARCH =====
async function getStudentsByFilter(filter) {
  try {
    let query = supabaseClient.from("students").select("*");

    if (filter.year && filter.year !== "all") {
      query = query.eq("year", filter.year);
    }
    if (filter.semester && filter.semester !== "all") {
      query = query.eq("semester", filter.semester);
    }
    if (filter.branch && filter.branch !== "all") {
      query = query.eq("branch_code", filter.branch);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error filtering students:", error);
    return [];
  }
}

async function getClassesByFilter(filter) {
  try {
    let query = supabaseClient.from("classes").select("*");

    if (filter.year && filter.year !== "all") {
      query = query.eq("year", filter.year);
    }
    if (filter.semester && filter.semester !== "all") {
      query = query.eq("semester", filter.semester);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error filtering classes:", error);
    return [];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initDB,
    addRecord,
    updateRecord,
    getAll,
    getRecord,
    deleteRecord,
    clearStore,
    deleteClass,
    deleteYear,
    loadAttendance,
    markAttendance,
    loadStudentStats,
    getStudentsByFilter,
    getClassesByFilter,
  };
}
