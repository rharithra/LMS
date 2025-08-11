import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePayslipPDF = async (payrollData) => {
  // Create a temporary div to render the payslip content
  const payslipDiv = document.createElement('div');
  payslipDiv.style.width = '800px';
  payslipDiv.style.padding = '20px';
  payslipDiv.style.backgroundColor = 'white';
  payslipDiv.style.fontFamily = 'Arial, sans-serif';
  payslipDiv.style.position = 'absolute';
  payslipDiv.style.left = '-9999px';
  payslipDiv.style.top = '0';
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  // Generate the payslip HTML content
  payslipDiv.innerHTML = `
    <div style="border: 2px solid #333; padding: 20px; max-width: 760px; margin: 0 auto;">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="margin: 0; color: #2563eb; font-size: 28px; font-weight: bold;">COMPANY NAME</h1>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">Employee Payslip</p>
        <p style="margin: 5px 0; color: #666; font-size: 12px;">Period: ${getMonthName(payrollData.month)} ${payrollData.year}</p>
      </div>

      <!-- Employee Information -->
      <div style="margin-bottom: 20px;">
        <h2 style="color: #333; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          Employee Information
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <strong>Name:</strong> ${payrollData.employee?.firstName} ${payrollData.employee?.lastName}
          </div>
          <div>
            <strong>Employee ID:</strong> ${payrollData.employee?.employeeId}
          </div>
          <div>
            <strong>Department:</strong> ${payrollData.employee?.department}
          </div>
          <div>
            <strong>Email:</strong> ${payrollData.employee?.email}
          </div>
        </div>
      </div>

      <!-- Working Days Information -->
      <div style="margin-bottom: 20px;">
        <h2 style="color: #333; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          Working Days Information
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
          <div style="text-align: center; padding: 10px; background-color: #dbeafe; border-radius: 5px;">
            <div style="font-size: 24px; font-weight: bold; color: #1d4ed8;">${payrollData.workingDays}</div>
            <div style="font-size: 12px; color: #666;">Total Working Days</div>
          </div>
          <div style="text-align: center; padding: 10px; background-color: #dcfce7; border-radius: 5px;">
            <div style="font-size: 24px; font-weight: bold; color: #16a34a;">${payrollData.actualWorkingDays}</div>
            <div style="font-size: 12px; color: #666;">Actual Working Days</div>
          </div>
          <div style="text-align: center; padding: 10px; background-color: #fee2e2; border-radius: 5px;">
            <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${payrollData.leaveDays}</div>
            <div style="font-size: 12px; color: #666;">Leave Days</div>
          </div>
        </div>
      </div>

      <!-- Salary Breakdown -->
      <div style="margin-bottom: 20px;">
        <h2 style="color: #333; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          Salary Breakdown
        </h2>
        
        <!-- Earnings -->
        <div style="margin-bottom: 15px;">
          <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">Earnings</h3>
          <div style="border: 1px solid #ddd; border-radius: 5px; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee; background-color: #f9fafb;">
              <span style="font-weight: bold;">Description</span>
              <span style="font-weight: bold;">Amount</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee;">
              <span>Basic Salary</span>
              <span>${formatCurrency(payrollData.basicSalary)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee;">
              <span>House Rent Allowance (HRA)</span>
              <span>${formatCurrency(payrollData.hra || 0)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee;">
              <span>Dearness Allowance (DA)</span>
              <span>${formatCurrency(payrollData.da || 0)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee;">
              <span>Transport Allowance (TA)</span>
              <span>${formatCurrency(payrollData.ta || 0)}</span>
            </div>
            ${(payrollData.bonus || 0) > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee;">
              <span>Performance Incentive</span>
              <span style="color: #16a34a;">${formatCurrency(payrollData.bonus)}</span>
            </div>
            ` : ''}
            ${(payrollData.specialAllowance || 0) > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee;">
              <span>Special Allowance</span>
              <span>${formatCurrency(payrollData.specialAllowance)}</span>
            </div>
            ` : ''}
            ${(payrollData.medicalAllowance || 0) > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee;">
              <span>Medical Allowance</span>
              <span>${formatCurrency(payrollData.medicalAllowance)}</span>
            </div>
            ` : ''}
            ${(payrollData.conveyanceAllowance || 0) > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee;">
              <span>Conveyance Allowance</span>
              <span>${formatCurrency(payrollData.conveyanceAllowance)}</span>
            </div>
            ` : ''}
            ${(payrollData.foodAllowance || 0) > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee;">
              <span>Food Allowance</span>
              <span>${formatCurrency(payrollData.foodAllowance)}</span>
            </div>
            ` : ''}
            ${(payrollData.otherAllowances || 0) > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee;">
              <span>Other Allowances</span>
              <span>${formatCurrency(payrollData.otherAllowances)}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; background-color: #dbeafe; font-weight: bold;">
              <span>Total Allowances</span>
              <span>${formatCurrency((payrollData.hra || 0) + (payrollData.da || 0) + (payrollData.ta || 0) + (payrollData.bonus || 0) + (payrollData.specialAllowance || 0) + (payrollData.medicalAllowance || 0) + (payrollData.conveyanceAllowance || 0) + (payrollData.foodAllowance || 0) + (payrollData.otherAllowances || 0))}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; background-color: #dcfce7; font-weight: bold;">
              <span>Gross Salary</span>
              <span>${formatCurrency(payrollData.grossSalary)}</span>
            </div>
          </div>
        </div>

        <!-- Deductions -->
        <div style="margin-bottom: 15px;">
          <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">Deductions</h3>
          <div style="border: 1px solid #ddd; border-radius: 5px; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee; background-color: #f9fafb;">
              <span style="font-weight: bold;">Description</span>
              <span style="font-weight: bold;">Amount</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee;">
              <span>Provident Fund (PF)</span>
              <span style="color: #dc2626;">-${formatCurrency(payrollData.pf || 0)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee;">
              <span>Income Tax</span>
              <span style="color: #dc2626;">-${formatCurrency(payrollData.tax || 0)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; background-color: #fee2e2; font-weight: bold;">
              <span>Total Deductions</span>
              <span style="color: #dc2626;">-${formatCurrency(payrollData.deductions || ((payrollData.pf || 0) + (payrollData.tax || 0)))}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; background-color: #fef3c7; font-weight: bold;">
              <span>Leave Deduction</span>
              <span style="color: #d97706;">-${formatCurrency(payrollData.leaveDeduction || 0)}</span>
            </div>
          </div>
        </div>

        <!-- Net Salary -->
        <div style="border: 2px solid #16a34a; border-radius: 5px; padding: 15px; background-color: #dcfce7; text-align: center;">
          <div style="font-size: 20px; font-weight: bold; color: #16a34a;">
            Net Salary: ${formatCurrency(payrollData.netSalary)}
          </div>
        </div>
      </div>

      <!-- Leave Details -->
      ${payrollData.leaveBreakdown && Object.keys(payrollData.leaveBreakdown).length > 0 ? `
      <div style="margin-bottom: 20px;">
        <h2 style="color: #333; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          Leave Details
        </h2>
        <div style="border: 1px solid #ddd; border-radius: 5px; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee; background-color: #f9fafb;">
            <span style="font-weight: bold;">Leave Type</span>
            <span style="font-weight: bold;">Days</span>
          </div>
          ${Object.entries(payrollData.leaveBreakdown).map(([leaveType, days]) => `
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee;">
              <span>${leaveType}</span>
              <span>${days} days</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Payroll Information -->
      <div style="margin-bottom: 20px;">
        <h2 style="color: #333; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          Payroll Information
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <strong>Payroll Period:</strong> ${getMonthName(payrollData.month)} ${payrollData.year}
          </div>
          <div>
            <strong>Generated On:</strong> ${new Date(payrollData.generatedAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Generated By:</strong> User ID: ${payrollData.generatedBy}
          </div>
          <div>
            <strong>Payroll ID:</strong> ${payrollData.id}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 2px solid #333; padding-top: 20px; margin-top: 20px;">
        <p style="margin: 5px 0; color: #666; font-size: 12px;">
          This is a computer generated document and does not require a signature.
        </p>
        <p style="margin: 5px 0; color: #666; font-size: 12px;">
          Generated on: ${new Date().toLocaleString()}
        </p>
      </div>
    </div>
  `;

  // Add the div to the document
  document.body.appendChild(payslipDiv);

  try {
    // Convert the div to canvas
    const canvas = await html2canvas(payslipDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename
    const filename = `payslip_${payrollData.employee?.firstName}_${payrollData.employee?.lastName}_${getMonthName(payrollData.month)}_${payrollData.year}.pdf`;

    // Save the PDF
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    // Clean up
    document.body.removeChild(payslipDiv);
  }
}; 