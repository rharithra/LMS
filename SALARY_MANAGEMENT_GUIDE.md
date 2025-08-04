# Salary Management Guide

## Overview
The Employee Management System provides comprehensive salary management capabilities with both individual and bulk salary setup options. All salary components are editable and can be customized per employee.

## Salary Components

### Core Components (Editable)
1. **Basic Salary** - The fundamental salary component
2. **House Rent Allowance (HRA)** - Standard housing allowance
3. **Dearness Allowance (DA)** - Cost of living adjustment
4. **Transport Allowance (TA)** - Transportation benefit
5. **Provident Fund (PF)** - Retirement contribution
6. **Income Tax** - Tax deduction

### Variable Components (Editable)
1. **Performance Incentive** - Monthly performance-based bonus
2. **Special Allowance** - Additional benefits
3. **Medical Allowance** - Health benefits
4. **Conveyance Allowance** - Transport benefits
5. **Food Allowance** - Meal benefits
6. **Other Allowances** - Additional benefits

## How to Set Up Salary Data

### Method 1: Individual Salary Setup
1. **Navigate to Users Page**
   - Go to the Users section in the sidebar
   - Click on "Users" in the navigation

2. **Edit Individual Salary**
   - Find the employee in the users list
   - Click the "Salary" button next to their name
   - This opens the Salary Modal

3. **Configure Salary Components**
   - **Basic Salary**: Set the core salary amount
   - **Allowances**: Configure HRA, DA, TA, and other allowances
   - **Deductions**: Set PF and Tax amounts
   - **Performance Incentive**: Set monthly performance bonus (varies by performance)

4. **Review and Save**
   - Check the salary summary at the bottom
   - Click "Update Salary" to save changes

### Method 2: Bulk Salary Setup
1. **Access Bulk Setup**
   - Go to Users page
   - Click "Bulk Salary Setup" button

2. **Select Employees**
   - Choose which employees to update
   - Use "Select All" or "Clear All" for convenience
   - Selected count is shown at the bottom

3. **Configure Salary Template**
   - Set the salary structure template
   - All selected employees will get this structure
   - Review the template summary

4. **Apply to Selected Employees**
   - Click "Update X Employees" to apply
   - All selected employees will be updated with the template

## Salary Calculation Process

### Gross Salary Calculation
```
Gross Salary = Basic Salary + Total Allowances
Total Allowances = HRA + DA + TA + Performance Incentive + Special Allowance + Medical Allowance + Conveyance Allowance + Food Allowance + Other Allowances
```

### Net Salary Calculation
```
Net Salary = Gross Salary - Total Deductions
Total Deductions = PF + Tax
```

### Payroll Generation
When generating payroll:
1. **Working Days Calculation**
   - Total working days for the month (usually 22)
   - Actual working days = Total days - Leave days taken
   - Leave deduction = (Leave days × Daily rate)

2. **Final Salary**
   - Final Net Salary = Net Salary - Leave Deduction
   - Daily rate = Net Salary ÷ Working days

## Best Practices

### 1. Initial Setup
- Use "Bulk Salary Setup" for initial employee salary configuration
- Set standard allowances (HRA, DA, TA) based on company policy
- Configure deductions (PF, Tax) according to regulations

### 2. Performance Incentives
- Update performance incentives monthly based on performance reviews
- Use individual salary editing for performance-based adjustments
- Keep performance incentives separate from fixed allowances

### 3. Regular Updates
- Review and update allowances annually
- Adjust basic salary based on promotions/raises
- Update deductions based on tax law changes

### 4. Data Management
- All salary data is stored per employee
- Changes are immediately reflected in payroll generation
- Historical payroll data is preserved

## Access Control

### Admin Access
- Full access to all salary management features
- Can edit any employee's salary
- Can use bulk salary setup

### Manager Access
- Can view team member salaries
- Can edit team member salaries
- Cannot access bulk salary setup

### Employee Access
- Can view their own salary information
- Cannot edit salary data
- Can view their own payroll history

## Troubleshooting

### Common Issues

1. **Salary not updating**
   - Check if you have proper permissions
   - Ensure all required fields are filled
   - Check for validation errors

2. **Payroll calculation errors**
   - Verify salary components are properly set
   - Check working days calculation
   - Ensure leave data is accurate

3. **Bulk update not working**
   - Make sure employees are selected
   - Check template values are valid
   - Verify network connection

### Support
- All salary changes are logged
- Check the notification system for update confirmations
- Contact system administrator for technical issues

## Security Notes

- Salary data is sensitive information
- Access is restricted based on user roles
- All changes are tracked and logged
- Data is backed up regularly

## Integration with Payroll

The salary management system is fully integrated with the payroll system:

1. **Automatic Calculation**: Payroll uses current salary data
2. **Leave Integration**: Leave deductions are automatically calculated
3. **Performance Tracking**: Performance incentives can be updated monthly
4. **Historical Data**: All salary changes are preserved for audit trails

This comprehensive salary management system ensures accurate payroll generation while providing flexibility for individual employee customization. 