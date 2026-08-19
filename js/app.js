/**
 * Tuition Register - Attendance & Fee Tracker JavaScript Engine
 * Ultra-fast Vanilla JS with local storage state management
 */

// Initial Default Sample Data for First Time Launch
const DEFAULT_STORE = {
  activeBatchId: 'b1',
  batches: [
    {
      id: 'b1',
      name: '10th Maths - Evening Batch',
      subject: 'Mathematics',
      monthlyFee: 1200,
      feeDueDateDay: 5
    },
    {
      id: 'b2',
      name: '12th Physics - Morning Batch',
      subject: 'Physics',
      monthlyFee: 1500,
      feeDueDateDay: 10
    }
  ],
  students: [
    {
      id: 's1',
      batchId: 'b1',
      rollNo: 1,
      name: 'Betty Beardmore',
      parentName: 'Robert Beardmore',
      phone: '9876543210',
      joiningDate: '2026-01-10',
      customFee: 1200
    },
    {
      id: 's2',
      batchId: 'b1',
      rollNo: 2,
      name: 'Rudy Shine',
      parentName: 'Karthik Shine',
      phone: '9876543211',
      joiningDate: '2026-01-12',
      customFee: 1200
    },
    {
      id: 's3',
      batchId: 'b1',
      rollNo: 3,
      name: 'Hallie Fabbri',
      parentName: 'David Fabbri',
      phone: '9876543212',
      joiningDate: '2026-02-01',
      customFee: 1200
    },
    {
      id: 's4',
      batchId: 'b1',
      rollNo: 4,
      name: 'Lucy Peter',
      parentName: 'Karl Peter',
      phone: '9876543213',
      joiningDate: '2026-02-15',
      customFee: 1200
    },
    {
      id: 's5',
      batchId: 'b1',
      rollNo: 5,
      name: 'Jack Mathew',
      parentName: 'Mathew Thomas',
      phone: '9876543214',
      joiningDate: '2026-03-01',
      customFee: 1200
    }
  ],
  // Key format: `${studentId}_${YYYY-MM-DD}` => 'P' | 'A' | 'L' | 'H'
  attendance: {},
  // Key format: `${studentId}_${YYYY-MM}` => { id, amount, date, mode, note }
  payments: {}
};

class TuitionApp {
  constructor() {
    this.store = this.loadStore();
    
    // Date state
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth(); // 0-indexed (0 = Jan)

    this.selectedStudentId = null;

    this.initDOMReferences();
    this.bindEvents();
    this.seedInitialSampleDataIfEmpty();
    this.render();
  }

  // Local Storage Store Handlers
  loadStore() {
    try {
      const data = localStorage.getItem('tuition_register_store');
      return data ? JSON.parse(data) : DEFAULT_STORE;
    } catch (e) {
      console.error('Failed to load store:', e);
      return DEFAULT_STORE;
    }
  }

  saveStore() {
    try {
      localStorage.setItem('tuition_register_store', JSON.stringify(this.store));
    } catch (e) {
      console.error('Failed to save store:', e);
    }
  }

  seedInitialSampleDataIfEmpty() {
    if (!this.store.attendance || Object.keys(this.store.attendance).length === 0) {
      // Seed current month sample attendance
      const year = this.currentYear;
      const monthStr = String(this.currentMonth + 1).padStart(2, '0');
      
      const sampleDays = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15'];
      const statuses = ['P', 'P', 'P', 'A', 'P', 'P', 'L', 'P', 'P', 'H', 'P', 'P', 'P', 'P', 'P'];
      
      this.store.students.forEach(st => {
        sampleDays.forEach((d, idx) => {
          const dateKey = `${st.id}_${year}-${monthStr}-${d}`;
          // Add slight variety
          const stOffset = (parseInt(st.rollNo) + idx) % statuses.length;
          this.store.attendance[dateKey] = statuses[stOffset];
        });

        // Seed some sample fee payments
        const payKey = `${st.id}_${year}-${monthStr}`;
        if (st.rollNo % 2 === 1) {
          this.store.payments[payKey] = {
            id: 'pay_' + Date.now() + '_' + st.rollNo,
            amount: st.customFee,
            date: `${year}-${monthStr}-05`,
            mode: 'UPI',
            note: 'Paid via PhonePe'
          };
        }
      });
      this.saveStore();
    }
  }

  initDOMReferences() {
    // Header & Toolbar
    this.batchSelect = document.getElementById('batchSelect');
    this.monthTitle = document.getElementById('monthTitle');
    this.btnPrevMonth = document.getElementById('btnPrevMonth');
    this.btnNextMonth = document.getElementById('btnNextMonth');

    // Stats
    this.statPresent = document.getElementById('statPresent');
    this.statFeeDue = document.getElementById('statFeeDue');

    // Register Viewport
    this.registerTable = document.getElementById('registerTable');
    this.tableHeaderRow = document.getElementById('tableHeaderRow');
    this.tableBody = document.getElementById('tableBody');

    // Actions
    this.btnMarkAllPresent = document.getElementById('btnMarkAllPresent');
    this.btnAddStudent = document.getElementById('btnAddStudent');
    this.btnCreateBatch = document.getElementById('btnCreateBatch');

    // Drawer
    this.drawerOverlay = document.getElementById('drawerOverlay');
    this.studentDrawer = document.getElementById('studentDrawer');
    this.btnCloseDrawer = document.getElementById('btnCloseDrawer');

    // Drawer Details Elements
    this.drawerName = document.getElementById('drawerName');
    this.drawerMeta = document.getElementById('drawerMeta');
    this.drawerAvatar = document.getElementById('drawerAvatar');
    this.btnWhatsAppReminder = document.getElementById('btnWhatsAppReminder');
    this.btnCallParent = document.getElementById('btnCallParent');
    this.btnEditStudent = document.getElementById('btnEditStudent');
    this.btnRecordPayment = document.getElementById('btnRecordPayment');

    this.feeStatusBanner = document.getElementById('feeStatusBanner');
    this.paymentHistoryList = document.getElementById('paymentHistoryList');

    this.statPct = document.getElementById('statPct');
    this.statTotalP = document.getElementById('statTotalP');
    this.statTotalA = document.getElementById('statTotalA');

    // Modals
    this.modalStudent = document.getElementById('modalStudent');
    this.formStudent = document.getElementById('formStudent');
    this.btnCancelStudent = document.getElementById('btnCancelStudent');

    this.modalPayment = document.getElementById('modalPayment');
    this.formPayment = document.getElementById('formPayment');
    this.btnCancelPayment = document.getElementById('btnCancelPayment');

    this.modalBatch = document.getElementById('modalBatch');
    this.formBatch = document.getElementById('formBatch');
    this.btnCancelBatch = document.getElementById('btnCancelBatch');

    this.btnBackup = document.getElementById('btnBackup');
  }

  bindEvents() {
    // Month navigation
    this.btnPrevMonth.addEventListener('click', () => {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.render();
    });

    this.btnNextMonth.addEventListener('click', () => {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.render();
    });

    // Batch Switcher
    this.batchSelect.addEventListener('change', (e) => {
      if (e.target.value === '__new__') {
        this.openModal(this.modalBatch);
        this.batchSelect.value = this.store.activeBatchId;
      } else {
        this.store.activeBatchId = e.target.value;
        this.saveStore();
        this.render();
      }
    });

    // Mark All Present Today
    this.btnMarkAllPresent.addEventListener('click', () => this.markAllPresentToday());

    // Add Student Button
    this.btnAddStudent.addEventListener('click', () => {
      this.formStudent.reset();
      document.getElementById('studentEditId').value = '';
      document.getElementById('modalStudentTitle').innerText = 'Add New Student';
      this.openModal(this.modalStudent);
    });

    // Add Batch Button
    this.btnCreateBatch.addEventListener('click', () => {
      this.formBatch.reset();
      this.openModal(this.modalBatch);
    });

    // Drawer Close
    this.btnCloseDrawer.addEventListener('click', () => this.closeDrawer());
    this.drawerOverlay.addEventListener('click', () => this.closeDrawer());

    // Form Submissions
    this.formStudent.addEventListener('submit', (e) => this.handleSaveStudent(e));
    this.formPayment.addEventListener('submit', (e) => this.handleSavePayment(e));
    this.formBatch.addEventListener('submit', (e) => this.handleSaveBatch(e));

    // Cancel Modals
    this.btnCancelStudent.addEventListener('click', () => this.closeModal(this.modalStudent));
    this.btnCancelPayment.addEventListener('click', () => this.closeModal(this.modalPayment));
    this.btnCancelBatch.addEventListener('click', () => this.closeModal(this.modalBatch));

    // Record Payment Trigger
    this.btnRecordPayment.addEventListener('click', () => {
      if (!this.selectedStudentId) return;
      const st = this.store.students.find(s => s.id === this.selectedStudentId);
      const batch = this.getActiveBatch();
      document.getElementById('payAmount').value = st.customFee || batch.monthlyFee;
      
      const monthStr = String(this.currentMonth + 1).padStart(2, '0');
      document.getElementById('payMonth').value = `${this.currentYear}-${monthStr}`;
      document.getElementById('payDate').valueAsDate = new Date();
      
      this.openModal(this.modalPayment);
    });

    // WhatsApp Reminder
    this.btnWhatsAppReminder.addEventListener('click', () => this.sendWhatsAppFeeReminder());

    // Call Parent
    this.btnCallParent.addEventListener('click', () => {
      if (!this.selectedStudentId) return;
      const st = this.store.students.find(s => s.id === this.selectedStudentId);
      if (st && st.phone) {
        window.location.href = `tel:${st.phone}`;
      } else {
        alert('Parent phone number not available.');
      }
    });

    // Edit Student Button in Drawer
    this.btnEditStudent.addEventListener('click', () => {
      if (!this.selectedStudentId) return;
      const st = this.store.students.find(s => s.id === this.selectedStudentId);
      if (!st) return;

      document.getElementById('studentEditId').value = st.id;
      document.getElementById('stName').value = st.name;
      document.getElementById('stParent').value = st.parentName || '';
      document.getElementById('stPhone').value = st.phone || '';
      document.getElementById('stFee').value = st.customFee || '';
      document.getElementById('modalStudentTitle').innerText = 'Edit Student Details';
      
      this.openModal(this.modalStudent);
    });

    // Backup Export
    this.btnBackup.addEventListener('click', () => this.exportBackupJSON());
  }

  // Active Data Helpers
  getActiveBatch() {
    return this.store.batches.find(b => b.id === this.store.activeBatchId) || this.store.batches[0];
  }

  getActiveStudents() {
    return this.store.students.filter(s => s.batchId === this.store.activeBatchId);
  }

  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  // Main Render Engine
  render() {
    this.renderBatchSelectOptions();
    this.renderMonthTitle();
    this.renderRegisterMatrix();
    this.renderSummaryStats();
  }

  renderBatchSelectOptions() {
    this.batchSelect.innerHTML = '';
    this.store.batches.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = b.name;
      if (b.id === this.store.activeBatchId) opt.selected = true;
      this.batchSelect.appendChild(opt);
    });

    const newOpt = document.createElement('option');
    newOpt.value = '__new__';
    newOpt.textContent = '+ Add New Tuition Batch';
    this.batchSelect.appendChild(newOpt);
  }

  renderMonthTitle() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.monthTitle.innerText = `${monthNames[this.currentMonth]} ${this.currentYear}`;
  }

  renderRegisterMatrix() {
    const numDays = this.getDaysInMonth(this.currentYear, this.currentMonth);
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === this.currentYear && today.getMonth() === this.currentMonth;
    const todayDate = today.getDate();

    // 1. Build Header Row (Corner cell + Date headers)
    let headerHTML = `
      <th class="corner-header">
        <div class="corner-content">
          <span># S.No</span>
          <span>Student Name</span>
        </div>
      </th>
    `;

    const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let day = 1; day <= numDays; day++) {
      const dateObj = new Date(this.currentYear, this.currentMonth, day);
      const dayOfWeek = dateObj.getDay();
      const isSunday = dayOfWeek === 0;
      const isTodayDay = isCurrentMonth && day === todayDate;

      let classNames = 'date-header';
      if (isSunday) classNames += ' sunday';
      if (isTodayDay) classNames += ' today';

      headerHTML += `
        <th class="${classNames}">
          <div class="date-header-cell">
            <span class="day-name">${dayShortNames[dayOfWeek]}</span>
            <span class="day-num">${String(day).padStart(2, '0')}</span>
          </div>
        </th>
      `;
    }

    this.tableHeaderRow.innerHTML = headerHTML;

    // 2. Build Student Rows & Attendance Matrix
    const students = this.getActiveStudents();
    if (students.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="${numDays + 1}">
            <div class="empty-state">
              <div style="font-size: 2.5rem; margin-bottom: 8px;">📓</div>
              <h3>No Students Added Yet</h3>
              <p>Click <strong>"+ Add Student"</strong> to start taking attendance in this tuition batch.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const monthKeyStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}`;
    let bodyHTML = '';

    students.forEach((st, idx) => {
      const isFeePaid = !!this.store.payments[`${st.id}_${monthKeyStr}`];
      const feeBadgeClass = isFeePaid ? 'paid' : 'due';

      bodyHTML += `<tr>`;
      
      // Sticky Student Name Cell
      bodyHTML += `
        <td class="student-col" onclick="app.openStudentDrawer('${st.id}')">
          <div class="student-info-cell">
            <span class="sno-badge">${idx + 1}</span>
            <div class="student-name-box">
              <div class="student-name">${st.name}</div>
            </div>
            <span class="fee-badge-mini ${feeBadgeClass}" title="${isFeePaid ? 'Fee Paid' : 'Fee Pending'}"></span>
          </div>
        </td>
      `;

      // Attendance Cells for 1..numDays
      for (let day = 1; day <= numDays; day++) {
        const dayStr = String(day).padStart(2, '0');
        const dateKey = `${st.id}_${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${dayStr}`;
        const status = this.store.attendance[dateKey] || '';

        const dateObj = new Date(this.currentYear, this.currentMonth, day);
        const isSunday = dateObj.getDay() === 0;
        const cellClass = isSunday ? 'attendance-cell sunday-col' : 'attendance-cell';

        let pillHTML = `<div class="cell-pill empty">•</div>`;
        if (status === 'P') pillHTML = `<div class="cell-pill P">P</div>`;
        else if (status === 'A') pillHTML = `<div class="cell-pill A">A</div>`;
        else if (status === 'L') pillHTML = `<div class="cell-pill L">L</div>`;
        else if (status === 'H') pillHTML = `<div class="cell-pill H">H</div>`;

        bodyHTML += `
          <td class="${cellClass}" onclick="app.toggleAttendance('${dateKey}')">
            ${pillHTML}
          </td>
        `;
      }

      bodyHTML += `</tr>`;
    });

    this.tableBody.innerHTML = bodyHTML;
  }

  // Toggle Cell Status on Tap: Empty -> P -> A -> L -> H -> Empty
  toggleAttendance(dateKey) {
    const current = this.store.attendance[dateKey] || '';
    const sequence = ['', 'P', 'A', 'L', 'H'];
    const nextIdx = (sequence.indexOf(current) + 1) % sequence.length;
    const nextStatus = sequence[nextIdx];

    if (nextStatus) {
      this.store.attendance[dateKey] = nextStatus;
    } else {
      delete this.store.attendance[dateKey];
    }

    this.saveStore();
    this.render();
  }

  markAllPresentToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const dayStr = String(today.getDate()).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');

    const students = this.getActiveStudents();
    students.forEach(st => {
      const dateKey = `${st.id}_${year}-${monthStr}-${dayStr}`;
      this.store.attendance[dateKey] = 'P';
    });

    this.saveStore();
    this.render();
    alert(`Marked all ${students.length} students Present for today (${dayStr}/${monthStr})!`);
  }

  // Summary Stats
  renderSummaryStats() {
    const students = this.getActiveStudents();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let presentToday = 0;
    students.forEach(st => {
      if (this.store.attendance[`${st.id}_${todayStr}`] === 'P') {
        presentToday++;
      }
    });

    this.statPresent.innerText = `Present Today: ${presentToday}/${students.length}`;

    // Fee due count
    const monthKeyStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}`;
    let feeDueCount = 0;
    students.forEach(st => {
      if (!this.store.payments[`${st.id}_${monthKeyStr}`]) {
        feeDueCount++;
      }
    });

    this.statFeeDue.innerText = `Fee Pending: ${feeDueCount} Students`;
  }

  // Slide-over Student Detail Drawer
  openStudentDrawer(studentId) {
    this.selectedStudentId = studentId;
    const st = this.store.students.find(s => s.id === studentId);
    if (!st) return;

    const batch = this.getActiveBatch();

    // Student Header
    this.drawerName.innerText = st.name;
    this.drawerMeta.innerText = `Roll #${st.rollNo} • ${batch.name} • Joined: ${st.joiningDate || 'N/A'}`;
    this.drawerAvatar.innerText = st.name.charAt(0).toUpperCase();

    // Fee Banner Status
    const monthKeyStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}`;
    const payment = this.store.payments[`${st.id}_${monthKeyStr}`];

    if (payment) {
      this.feeStatusBanner.className = 'fee-status-banner paid';
      this.feeStatusBanner.innerHTML = `
        <div class="banner-left">
          <h4>Fee Paid ✓</h4>
          <p>₹${payment.amount} paid on ${payment.date} via ${payment.mode}</p>
        </div>
      `;
    } else {
      const feeAmount = st.customFee || batch.monthlyFee;
      this.feeStatusBanner.className = 'fee-status-banner due';
      this.feeStatusBanner.innerHTML = `
        <div class="banner-left">
          <h4>Fee Pending: ₹${feeAmount}</h4>
          <p>Due Date: ${batch.feeDueDateDay || 5}th of this month</p>
        </div>
      `;
    }

    // Payment History List
    this.renderPaymentHistory(st.id);

    // Attendance Statistics
    this.renderStudentAttendanceStats(st.id);

    // Show Drawer
    this.drawerOverlay.classList.add('active');
    this.studentDrawer.classList.add('active');
  }

  closeDrawer() {
    this.drawerOverlay.classList.remove('active');
    this.studentDrawer.classList.remove('active');
    this.selectedStudentId = null;
  }

  renderPaymentHistory(studentId) {
    const historyKeys = Object.keys(this.store.payments).filter(k => k.startsWith(studentId + '_'));
    if (historyKeys.length === 0) {
      this.paymentHistoryList.innerHTML = `<p style="font-size: 0.85rem; color: #6B7280; font-style: italic;">No payment records logged yet.</p>`;
      return;
    }

    let html = '';
    historyKeys.sort().reverse().forEach(key => {
      const p = this.store.payments[key];
      const monthPart = key.split('_')[1]; // YYYY-MM
      html += `
        <div class="payment-item">
          <div>
            <div class="month">Month: ${monthPart}</div>
            <div class="date">Paid on ${p.date} • ${p.mode} ${p.note ? '(' + p.note + ')' : ''}</div>
          </div>
          <div class="amount">₹${p.amount}</div>
        </div>
      `;
    });
    this.paymentHistoryList.innerHTML = html;
  }

  renderStudentAttendanceStats(studentId) {
    const numDays = this.getDaysInMonth(this.currentYear, this.currentMonth);
    let pCount = 0, aCount = 0, lCount = 0;

    for (let day = 1; day <= numDays; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${studentId}_${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${dayStr}`;
      const status = this.store.attendance[dateKey];
      if (status === 'P') pCount++;
      else if (status === 'A') aCount++;
      else if (status === 'L') lCount++;
    }

    const totalMarked = pCount + aCount + lCount;
    const pct = totalMarked > 0 ? Math.round((pCount / totalMarked) * 100) : 0;

    this.statPct.innerText = `${pct}%`;
    this.statTotalP.innerText = pCount;
    this.statTotalA.innerText = aCount;
  }

  // 1-Click WhatsApp Parent Fee Reminder Link
  sendWhatsAppFeeReminder() {
    if (!this.selectedStudentId) return;
    const st = this.store.students.find(s => s.id === this.selectedStudentId);
    if (!st || !st.phone) {
      alert('Parent contact phone number is missing.');
      return;
    }

    const batch = this.getActiveBatch();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[this.currentMonth];
    const feeAmount = st.customFee || batch.monthlyFee;

    const message = `Respected Parent, This is a gentle reminder from ${batch.name} tuition. The monthly tuition fee of ₹${feeAmount} for ${st.name} for the month of ${monthName} ${this.currentYear} is due. Kindly remit at your earliest. Thank you!`;

    const cleanPhone = st.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;

    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  // Form Submission Handlers
  handleSaveStudent(e) {
    e.preventDefault();
    const editId = document.getElementById('studentEditId').value;
    const name = document.getElementById('stName').value.trim();
    const parentName = document.getElementById('stParent').value.trim();
    const phone = document.getElementById('stPhone').value.trim();
    const fee = parseInt(document.getElementById('stFee').value) || null;

    if (!name) return;

    if (editId) {
      // Edit Existing Student
      const st = this.store.students.find(s => s.id === editId);
      if (st) {
        st.name = name;
        st.parentName = parentName;
        st.phone = phone;
        if (fee) st.customFee = fee;
      }
    } else {
      // Create New Student
      const batchStudents = this.getActiveStudents();
      const newRollNo = batchStudents.length + 1;
      const newSt = {
        id: 's_' + Date.now(),
        batchId: this.store.activeBatchId,
        rollNo: newRollNo,
        name,
        parentName,
        phone,
        joiningDate: new Date().toISOString().split('T')[0],
        customFee: fee
      };
      this.store.students.push(newSt);
    }

    this.saveStore();
    this.closeModal(this.modalStudent);
    this.render();
    if (this.selectedStudentId) this.openStudentDrawer(this.selectedStudentId);
  }

  handleSavePayment(e) {
    e.preventDefault();
    if (!this.selectedStudentId) return;

    const amount = parseInt(document.getElementById('payAmount').value) || 0;
    const monthVal = document.getElementById('payMonth').value; // YYYY-MM
    const dateVal = document.getElementById('payDate').value;
    const modeVal = document.getElementById('payMode').value;
    const noteVal = document.getElementById('payNote').value.trim();

    if (!amount || !monthVal) return;

    const key = `${this.selectedStudentId}_${monthVal}`;
    this.store.payments[key] = {
      id: 'pay_' + Date.now(),
      amount,
      date: dateVal,
      mode: modeVal,
      note: noteVal
    };

    this.saveStore();
    this.closeModal(this.modalPayment);
    this.openStudentDrawer(this.selectedStudentId);
    this.render();
  }

  handleSaveBatch(e) {
    e.preventDefault();
    const name = document.getElementById('batchName').value.trim();
    const subject = document.getElementById('batchSubject').value.trim();
    const fee = parseInt(document.getElementById('batchFee').value) || 1000;

    if (!name) return;

    const newBatch = {
      id: 'b_' + Date.now(),
      name,
      subject,
      monthlyFee: fee,
      feeDueDateDay: 5
    };

    this.store.batches.push(newBatch);
    this.store.activeBatchId = newBatch.id;
    this.saveStore();
    this.closeModal(this.modalBatch);
    this.render();
  }

  // Modal Control
  openModal(modalElem) {
    modalElem.classList.add('active');
  }

  closeModal(modalElem) {
    modalElem.classList.remove('active');
  }

  // JSON Data Backup Export
  exportBackupJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.store, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `tuition_register_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
  }
}

// Global App Instantiation
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new TuitionApp();
});
