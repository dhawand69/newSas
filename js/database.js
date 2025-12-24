// database.js - Supabase Database Functions

async function initDB() {
  try {
    await initSupabase();
    console.log("✅ Supabase initialized");
    return true;
  } catch (error) {
    console.error("❌ Supabase failed:", error);
    return false;
  }
}

// ========== GENERIC CRUD OPERATIONS ==========

async function addRecord(table, data) {
  try {
    const validColumns = getValidColumns(table);
    const cleanedData = Object.keys(data)
      .filter(key => validColumns.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    const { data: result, error } = await supabaseClient
      .from(table)
      .insert([cleanedData])
      .select();

    if (error) throw error;
    console.log(`✅ Added to ${table}:`, result[0]);
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
      .select("*");

    if (error) throw error;
    console.log(`✅ Fetched ${data?.length || 0} records from ${table}`);
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

async function updateRecord(table, record) {
  try {
    const { id, ...updates } = record;

    const validColumns = getValidColumns(table);
    const cleanedUpdates = Object.keys(updates)
      .filter(key => validColumns.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    cleanedUpdates.updatedAt = new Date().toISOString();

    const { data, error } = await supabaseClient
      .from(table)
      .update(cleanedUpdates)
      .eq("id", id)
      .select();

    if (error) throw error;
    console.log(`✅ Updated ${table}:`, data[0]);
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
    console.log(`✅ Deleted from ${table}`);
  } catch (error) {
    console.error(`❌ Error deleting from ${table}:`, error);
    throw error;
  }
}

// ========== COLUMN DEFINITIONS ==========

function getValidColumns(table) {
  const columns = {
    students: ['id', 'rollNo', 'firstName', 'lastName', 'email', 'department', 'year', 'semester', 'createdAt', 'updatedAt'],
    faculty: ['id', 'facultyId', 'firstName', 'lastName', 'email', 'department', 'specialization', 'password', 'createdAt', 'updatedAt'],
    classes: ['id', 'code', 'name', 'department', 'semester', 'faculty', 'year', 'credits', 'createdAt', 'updatedAt'],
    attendance: ['id', 'classId', 'studentId', 'date', 'session', 'status', 'notes', 'createdAt', 'updatedAt'],
    academic_years: ['id', 'year', 'startDate', 'endDate', 'type', 'createdAt'],
    settings: ['id', 'key', 'value', 'createdAt', 'updatedAt']
  };
  return columns[table] || [];
}

// ========== TABLE-SPECIFIC CRUD ==========

async function loadStudents() {
  return await getAll('students');
}

async function addStudent(studentData) {
  return await addRecord('students', studentData);
}

async function updateStudent(studentRecord) {
  return await updateRecord('students', studentRecord);
}

async function deleteStudent(id) {
  return await deleteRecord('students', id);
}

async function loadFaculty() {
  return await getAll('faculty');
}

async function addFaculty(facultyData) {
  return await addRecord('faculty', facultyData);
}

async function updateFaculty(facultyRecord) {
  return await updateRecord('faculty', facultyRecord);
}

async function deleteFaculty(id) {
  return await deleteRecord('faculty', id);
}

async function loadClasses() {
  return await getAll('classes');
}

async function addClass(classData) {
  return await addRecord('classes', classData);
}

async function updateClass(classRecord) {
  return await updateRecord('classes', classRecord);
}

async function deleteClass(id) {
  return await deleteRecord('classes', id);
}

async function loadAttendance() {
  return await getAll('attendance');
}

async function markAttendance(attendanceData) {
  return await addRecord('attendance', attendanceData);
}

async function updateAttendance(attendanceRecord) {
  return await updateRecord('attendance', attendanceRecord);
}

async function loadAcademicYears() {
  return await getAll('academic_years');
}

async function addAcademicYear(yearData) {
  return await addRecord('academic_years', yearData);
}

async function saveSetting(key, value) {
  try {
    const existing = await supabaseClient
      .from('settings')
      .select('*')
      .eq('key', key)
      .single();

    if (existing.data) {
      return await updateRecord('settings', {
        id: existing.data.id,
        key: key,
        value: value
      });
    } else {
      return await addRecord('settings', { key, value });
    }
  } catch (error) {
    console.error('Error saving setting:', error);
    throw error;
  }
}

// ========== FILTERING & QUERIES ==========

async function getStudentsByDepartment(department) {
  try {
    const { data, error } = await supabaseClient
      .from('students')
      .select('*')
      .eq('department', department);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error filtering students:', error);
    return [];
  }
}

async function getAttendanceByClass(classId, date = null) {
  try {
    let query = supabaseClient
      .from('attendance')
      .select('*')
      .eq('classId', classId);

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting attendance:', error);
    return [];
  }
}

async function getClassesByFaculty(facultyName) {
  try {
    const { data, error } = await supabaseClient
      .from('classes')
      .select('*')
      .eq('faculty', facultyName);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting classes:', error);
    return [];
  }
}

// ========== CLEAR STORE FOR IMPORTS ==========

async function clearStore(storeName) {
  try {
    const allRecords = await getAll(storeName);

    for (const record of allRecords) {
      await deleteRecord(storeName, record.id);
    }

    console.log(`✅ Cleared store: ${storeName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error clearing store ${storeName}:`, error);
    return false;
  }
}
