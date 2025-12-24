// database.js - Supabase Database Functions

// Initialize Supabase (assuming initSupabase() is defined elsewhere)
let supabaseClient;

async function initDB() {
  try {
    // Assuming initSupabase() initializes supabaseClient globally
    await initSupabase();
    console.log("✅ Supabase initialized");
    return true;
  } catch (error) {
    console.error("❌ Supabase failed:", error);
    return false;
  }
}

// ========== CLEAR ALL DATA ==========
async function clearStore() {
  try {
    console.log("🔄 Clearing all database tables...");
    
    // Clear tables in reverse order to respect foreign key constraints
    // Attendance typically has foreign keys to students/classes, so clear it first
    const tablesToClear = ['attendance', 'sessions', 'students', 'classes', 'faculty', 'academic_years'];
    
    let successCount = 0;
    let failCount = 0;
    
    for (const table of tablesToClear) {
      try {
        const { error } = await supabaseClient
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (error) {
          console.warn(`⚠️ Could not clear ${table}:`, error.message);
          failCount++;
        } else {
          console.log(`✅ Cleared ${table} table`);
          successCount++;
        }
      } catch (tableError) {
        console.warn(`⚠️ Error clearing ${table}:`, tableError.message);
        failCount++;
      }
    }
    
    console.log(`🎯 Clear store completed: ${successCount} tables cleared, ${failCount} failed`);
    return { success: true, cleared: successCount, failed: failCount };
  } catch (error) {
    console.error("❌ Error clearing store:", error);
    throw error;
  }
}

// ========== STUDENTS ==========
async function loadStudents() {
  try {
    const { data, error } = await supabaseClient
      .from("students")
      .select("*")
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error loading students:", error);
    return [];
  }
}

async function addStudent(studentData) {
  try {
    const { data, error } = await supabaseClient
      .from("students")
      .insert([{
        ...studentData,
        created_at: new Date().toISOString()
      }])
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("❌ Error adding student:", error);
    throw error;
  }
}

async function updateStudent(id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from("students")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("❌ Error updating student:", error);
    throw error;
  }
}

async function deleteStudent(id) {
  try {
    const { error } = await supabaseClient
      .from("students")
      .delete()
      .eq("id", id);
    if (error) throw error;
    console.log(`✅ Student ${id} deleted`);
    return true;
  } catch (error) {
    console.error("❌ Error deleting student:", error);
    throw error;
  }
}

async function getStudentById(id) {
  try {
    const { data, error } = await supabaseClient
      .from("students")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Error getting student by ID:", error);
    return null;
  }
}

// ========== ATTENDANCE ==========
async function loadAttendance() {
  try {
    const { data, error } = await supabaseClient
      .from("attendance")
      .select(`
        *,
        students (name, roll_number),
        classes (name)
      `)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error loading attendance:", error);
    return [];
  }
}

async function markAttendance(attendanceData) {
  try {
    const { data, error } = await supabaseClient
      .from("attendance")
      .insert([{
        ...attendanceData,
        created_at: new Date().toISOString()
      }])
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("❌ Error marking attendance:", error);
    throw error;
  }
}

async function updateAttendance(id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from("attendance")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("❌ Error updating attendance:", error);
    throw error;
  }
}

async function deleteAttendance(id) {
  try {
    const { error } = await supabaseClient
      .from("attendance")
      .delete()
      .eq("id", id);
    if (error) throw error;
    console.log(`✅ Attendance record ${id} deleted`);
    return true;
  } catch (error) {
    console.error("❌ Error deleting attendance:", error);
    throw error;
  }
}

// ========== CLASSES ==========
async function loadClasses() {
  try {
    const { data, error } = await supabaseClient
      .from("classes")
      .select(`
        *,
        faculty (name)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error loading classes:", error);
    return [];
  }
}

async function addClass(classData) {
  try {
    const { data, error } = await supabaseClient
      .from("classes")
      .insert([{
        ...classData,
        created_at: new Date().toISOString()
      }])
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("❌ Error adding class:", error);
    throw error;
  }
}

async function updateClass(id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from("classes")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("❌ Error updating class:", error);
    throw error;
  }
}

async function deleteClass(id) {
  try {
    const { error } = await supabaseClient
      .from("classes")
      .delete()
      .eq("id", id);
    if (error) throw error;
    console.log(`✅ Class ${id} deleted`);
    return true;
  } catch (error) {
    console.error("❌ Error deleting class:", error);
    throw error;
  }
}

async function getClassById(id) {
  try {
    const { data, error } = await supabaseClient
      .from("classes")
      .select(`
        *,
        faculty (name, email)
      `)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Error getting class by ID:", error);
    return null;
  }
}

// ========== FACULTY ==========
async function loadFaculty() {
  try {
    const { data, error } = await supabaseClient
      .from("faculty")
      .select("*")
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error loading faculty:", error);
    return [];
  }
}

async function addFaculty(facultyData) {
  try {
    const { data, error } = await supabaseClient
      .from("faculty")
      .insert([{
        ...facultyData,
        created_at: new Date().toISOString()
      }])
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("❌ Error adding faculty:", error);
    throw error;
  }
}

async function updateFaculty(id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from("faculty")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("❌ Error updating faculty:", error);
    throw error;
  }
}

async function deleteFaculty(id) {
  try {
    const { error } = await supabaseClient
      .from("faculty")
      .delete()
      .eq("id", id);
    if (error) throw error;
    console.log(`✅ Faculty ${id} deleted`);
    return true;
  } catch (error) {
    console.error("❌ Error deleting faculty:", error);
    throw error;
  }
}

async function getFacultyById(id) {
  try {
    const { data, error } = await supabaseClient
      .from("faculty")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Error getting faculty by ID:", error);
    return null;
  }
}

// ========== ACADEMIC YEARS ==========
async function loadAcademicYears() {
  try {
    const { data, error } = await supabaseClient
      .from("academic_years")
      .select("*")
      .order('start_date', { ascending: false });
    if (error) throw error;
    console.log("✅ Academic years loaded:", data);
    return data || [];
  } catch (error) {
    console.error("❌ Error fetching academic years:", error);
    return [];
  }
}

async function addAcademicYear(yearData) {
  try {
    const { data, error } = await supabaseClient
      .from("academic_years")
      .insert([{
        ...yearData,
        created_at: new Date().toISOString()
      }])
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("❌ Error adding academic year:", error);
    throw error;
  }
}

async function updateAcademicYear(id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from("academic_years")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("❌ Error updating academic year:", error);
    throw error;
  }
}

async function deleteAcademicYear(id) {
  try {
    const { error } = await supabaseClient
      .from("academic_years")
      .delete()
      .eq("id", id);
    if (error) throw error;
    console.log(`✅ Academic year ${id} deleted`);
    return true;
  } catch (error) {
    console.error("❌ Error deleting academic year:", error);
    throw error;
  }
}

// ========== SESSIONS ==========
async function loadSessions() {
  try {
    const { data, error } = await supabaseClient
      .from("sessions")
      .select("*")
      .order('start_time', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error loading sessions:", error);
    return [];
  }
}

async function addSession(sessionData) {
  try {
    const { data, error } = await supabaseClient
      .from("sessions")
      .insert([{
        ...sessionData,
        created_at: new Date().toISOString()
      }])
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("❌ Error adding session:", error);
    throw error;
  }
}

async function updateSession(id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from("sessions")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("❌ Error updating session:", error);
    throw error;
  }
}

async function deleteSession(id) {
  try {
    const { error } = await supabaseClient
      .from("sessions")
      .delete()
      .eq("id", id);
    if (error) throw error;
    console.log(`✅ Session ${id} deleted`);
    return true;
  } catch (error) {
    console.error("❌ Error deleting session:", error);
    throw error;
  }
}

// ========== GENERIC FUNCTIONS ==========
async function addRecord(table, data) {
  try {
    const { data: result, error } = await supabaseClient
      .from(table)
      .insert([{
        ...data,
        created_at: new Date().toISOString()
      }])
      .select();
    if (error) throw error;
    return result[0];
  } catch (error) {
    console.error(`❌ Error adding to ${table}:`, error);
    throw error;
  }
}

async function getAll(table) {
  try {
    const { data, error } = await supabaseClient
      .from(table)
      .select("*")
      .order('created_at', { ascending: false });
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

async function updateRecord(table, id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from(table)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error(`❌ Error updating ${table}:`, error);
    throw error;
  }
}

async function deleteRecord(table, id) {
  try {
    const { error } = await supabaseClient
      .from(table)
      .delete()
      .eq("id", id);
    if (error) throw error;
    console.log(`✅ Record ${id} deleted from ${table}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting from ${table}:`, error);
    throw error;
  }
}

// ========== FILTERING & QUERIES ==========
async function getStudentsByDepartment(department) {
  try {
    const { data, error } = await supabaseClient
      .from("students")
      .select("*")
      .eq("department", department)
      .order('roll_number');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error filtering students:", error);
    return [];
  }
}

async function getAttendanceByDate(date) {
  try {
    const { data, error } = await supabaseClient
      .from("attendance")
      .select(`
        *,
        students (name, roll_number),
        classes (name)
      `)
      .eq("date", date);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error getting attendance by date:", error);
    return [];
  }
}

async function getClassesByFaculty(facultyId) {
  try {
    const { data, error } = await supabaseClient
      .from("classes")
      .select("*")
      .eq("faculty_id", facultyId)
      .order('name');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error getting classes by faculty:", error);
    return [];
  }
}

async function getAttendanceByStudent(studentId, startDate, endDate) {
  try {
    let query = supabaseClient
      .from("attendance")
      .select("*")
      .eq("student_id", studentId);
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error getting attendance by student:", error);
    return [];
  }
}

async function getAttendanceByClass(classId, date) {
  try {
    let query = supabaseClient
      .from("attendance")
      .select(`
        *,
        students (name, roll_number)
      `)
      .eq("class_id", classId);
    
    if (date) {
      query = query.eq('date', date);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error getting attendance by class:", error);
    return [];
  }
}

async function searchStudents(searchTerm) {
  try {
    const { data, error } = await supabaseClient
      .from("students")
      .select("*")
      .or(`name.ilike.%${searchTerm}%,roll_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('name');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Error searching students:", error);
    return [];
  }
}

// ========== STATISTICS ==========
async function getAttendanceStats(startDate, endDate) {
  try {
    const { data, error } = await supabaseClient
      .from("attendance")
      .select("status, date")
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: data.length
    };
    
    data.forEach(record => {
      if (record.status === 'present') stats.present++;
      else if (record.status === 'absent') stats.absent++;
      else if (record.status === 'late') stats.late++;
      else if (record.status === 'excused') stats.excused++;
    });
    
    return stats;
  } catch (error) {
    console.error("❌ Error getting attendance stats:", error);
    return null;
  }
}

async function getStudentCountByDepartment() {
  try {
    const { data, error } = await supabaseClient
      .from("students")
      .select("department");
    
    if (error) throw error;
    
    const counts = {};
    data.forEach(student => {
      counts[student.department] = (counts[student.department] || 0) + 1;
    });
    
    return counts;
  } catch (error) {
    console.error("❌ Error getting student count by department:", error);
    return {};
  }
}

// ========== BATCH OPERATIONS ==========
async function batchAddStudents(studentsArray) {
  try {
    const { data, error } = await supabaseClient
      .from("students")
      .insert(studentsArray.map(student => ({
        ...student,
        created_at: new Date().toISOString()
      })))
      .select();
    
    if (error) throw error;
    console.log(`✅ Added ${data.length} students`);
    return data;
  } catch (error) {
    console.error("❌ Error batch adding students:", error);
    throw error;
  }
}

async function batchMarkAttendance(attendanceArray) {
  try {
    const { data, error } = await supabaseClient
      .from("attendance")
      .insert(attendanceArray.map(record => ({
        ...record,
        created_at: new Date().toISOString()
      })))
      .select();
    
    if (error) throw error;
    console.log(`✅ Marked ${data.length} attendance records`);
    return data;
  } catch (error) {
    console.error("❌ Error batch marking attendance:", error);
    throw error;
  }
}

// ========== EXPORT/IMPORT ==========
async function exportDatabase() {
  try {
    const tables = ['academic_years', 'faculty', 'classes', 'students', 'sessions', 'attendance'];
    const exportData = {};
    
    for (const table of tables) {
      const { data, error } = await supabaseClient
        .from(table)
        .select("*");
      
      if (error) {
        console.warn(`⚠️ Could not export ${table}:`, error.message);
        exportData[table] = [];
      } else {
        exportData[table] = data || [];
      }
    }
    
    return exportData;
  } catch (error) {
    console.error("❌ Error exporting database:", error);
    throw error;
  }
}

async function importDatabase(importData) {
  try {
    console.log("🔄 Importing database data...");
    
    // Clear existing data first
    await clearStore();
    
    let totalImported = 0;
    
    // Import in order to respect foreign key constraints
    const importOrder = ['academic_years', 'faculty', 'classes', 'students', 'sessions', 'attendance'];
    
    for (const table of importOrder) {
      if (importData[table] && importData[table].length > 0) {
        const { data, error } = await supabaseClient
          .from(table)
          .insert(importData[table])
          .select();
        
        if (error) {
          console.warn(`⚠️ Could not import ${table}:`, error.message);
        } else {
          console.log(`✅ Imported ${data.length} records to ${table}`);
          totalImported += data.length;
        }
      }
    }
    
    console.log(`🎯 Import completed: ${totalImported} total records imported`);
    return { success: true, imported: totalImported };
  } catch (error) {
    console.error("❌ Error importing database:", error);
    throw error;
  }
}

// ========== DATABASE MAINTENANCE ==========
async function checkDatabaseHealth() {
  try {
    const healthChecks = [
      { table: 'students', func: loadStudents },
      { table: 'classes', func: loadClasses },
      { table: 'faculty', func: loadFaculty },
      { table: 'attendance', func: loadAttendance }
    ];
    
    const results = {};
    
    for (const check of healthChecks) {
      try {
        const data = await check.func();
        results[check.table] = {
          healthy: true,
          count: data.length
        };
      } catch (error) {
        results[check.table] = {
          healthy: false,
          error: error.message
        };
      }
    }
    
    return results;
  } catch (error) {
    console.error("❌ Error checking database health:", error);
    return { overall: false, error: error.message };
  }
}

// Initialize database when script loads
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    console.log("📊 Database module loaded successfully");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
  }
});

// Make functions available globally
window.database = {
  // Core functions
  initDB,
  clearStore,
  
  // Student functions
  loadStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  getStudentById,
  getStudentsByDepartment,
  searchStudents,
  
  // Attendance functions
  loadAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByDate,
  getAttendanceByStudent,
  getAttendanceByClass,
  
  // Class functions
  loadClasses,
  addClass,
  updateClass,
  deleteClass,
  getClassById,
  getClassesByFaculty,
  
  // Faculty functions
  loadFaculty,
  addFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultyById,
  
  // Academic year functions
  loadAcademicYears,
  addAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  
  // Session functions
  loadSessions,
  addSession,
  updateSession,
  deleteSession,
  
  // Generic functions
  addRecord,
  getAll,
  getRecord,
  updateRecord,
  deleteRecord,
  
  // Statistics functions
  getAttendanceStats,
  getStudentCountByDepartment,
  
  // Batch operations
  batchAddStudents,
  batchMarkAttendance,
  
  // Export/Import
  exportDatabase,
  importDatabase,
  
  // Maintenance
  checkDatabaseHealth
};
