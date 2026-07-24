# Job Cost Tracking & Profitability Analysis

## Overview
The Job Cost Tracking system allows you to track all expenses associated with each job and calculate profitability in real-time. You can now see exactly how much profit or loss each job generates.

## Key Features

### 1. **Cost Tracking Components**
   - **Staff Costs**: Track hours worked and labor costs for each staff member
   - **Materials Costs**: Track materials used from inventory with automatic quantity deduction
   - **Equipment Costs**: Track equipment usage and fuel costs

### 2. **Real-Time Profitability Analysis**
   - **Service Revenue**: Base service price from the booking
   - **Total Costs**: Sum of all staff, materials, and equipment costs
   - **Gross Profit**: Revenue minus costs
   - **Profit Margin**: Percentage showing profitability

### 3. **Automatic Calculations**
   - Labor costs calculated automatically: hours worked × hourly rate
   - Material costs calculated automatically: quantity × unit cost
   - Equipment fuel costs tracked manually or from preset rates

## How to Use

### Step 1: Create a Job
1. Go to **Admin → Jobs**
2. Click **Create Job**
3. Select a confirmed booking
4. Set scheduled date and time
5. Click **Create Job**

### Step 2: Add Staff to Job
1. Click **View Details & Costs** on any job
2. In the **Staff Assigned** section:
   - Select a staff member from the dropdown
   - Enter hours worked
   - Click **Add Staff**
3. The system automatically calculates: `Labor Cost = Hours × Hourly Rate`

### Step 3: Add Materials to Job
1. In the **Materials Used** section:
   - Select a material from inventory
   - Enter quantity used
   - Click **Add Material**
2. The system automatically:
   - Calculates cost: `Material Cost = Quantity × Unit Cost`
   - Deducts quantity from inventory

### Step 4: Add Equipment to Job
1. In the **Equipment Used** section:
   - Select equipment (vehicle/machine)
   - Enter fuel used (liters)
   - Enter fuel cost
   - Click **Add Equipment**
2. Equipment status automatically updates to "in_use"

### Step 5: Monitor Profitability
Watch the dashboard at the top showing:
- **Service Revenue**: What you're charging the customer
- **Total Costs**: All expenses (staff + materials + equipment)
- **Gross Profit**: How much you're making
- **Profit Margin**: Profitability percentage

## Example Scenario

**Job**: Pool cleaning for RWF 50,000

**Costs Added**:
- Staff: John (8 hours × RWF 2,000/h) = RWF 16,000
- Staff: Mary (4 hours × RWF 1,500/h) = RWF 6,000
- Material: Chlorine (5 kg × RWF 800/kg) = RWF 4,000
- Material: Acid (2 L × RWF 1,200/L) = RWF 2,400
- Equipment: Pool Vacuum + Fuel = RWF 3,000

**Analysis**:
- Service Revenue: RWF 50,000
- Total Costs: RWF 31,400
- Gross Profit: RWF 18,600
- Profit Margin: 37.2%

## Benefits

1. **Know Your Profits**: See exactly how much each job makes
2. **Identify Problem Jobs**: Quickly spot unprofitable jobs
3. **Better Pricing**: Use historical data to price services accurately
4. **Cost Control**: Track where money is being spent
5. **Resource Optimization**: See which staff/equipment is most efficient
6. **Accurate Invoicing**: Invoice generation includes all tracked costs

## Database Structure

The system uses these tables:
- `jobs`: Main job records
- `job_staff`: Staff assignments with hours and labor costs
- `job_materials`: Materials used with quantities and costs
- `job_equipment`: Equipment used with fuel tracking
- `inventory`: Automatically updated when materials are used
- `equipment`: Status automatically updated (available/in_use)

## API Endpoints

### Job Details with Costs
- `GET /api/jobs/[id]` - Get job with all cost breakdowns

### Staff Management
- `POST /api/jobs/[id]/staff` - Add staff to job
- `DELETE /api/jobs/[id]/staff/[staffId]` - Remove staff

### Materials Management
- `POST /api/jobs/[id]/materials` - Add material to job
- `DELETE /api/jobs/[id]/materials/[materialId]` - Remove material

### Equipment Management
- `POST /api/jobs/[id]/equipment` - Add equipment to job
- `DELETE /api/jobs/[id]/equipment/[equipmentId]` - Remove equipment

## Important Notes

1. **Inventory Deduction**: When you add materials to a job, inventory is automatically reduced
2. **Inventory Restoration**: When you remove materials from a job, inventory is restored
3. **Equipment Status**: Equipment status changes to "in_use" when assigned to a job
4. **Labor Costs**: Make sure staff hourly rates are set correctly in Staff Management
5. **Material Costs**: Make sure unit costs are updated in Inventory Management
6. **Real-Time Updates**: All calculations update instantly as you add/remove items

## Tips for Accurate Tracking

1. **Set up costs first**:
   - Configure staff hourly rates in Staff Management
   - Set material unit costs in Inventory Management
   
2. **Track during the job**:
   - Add staff when they start working
   - Record actual hours worked, not estimates
   - Add materials as they're used
   
3. **Review before completion**:
   - Check all staff hours are recorded
   - Verify all materials are logged
   - Confirm equipment fuel costs
   
4. **Analyze profitability**:
   - Compare profit margins across similar jobs
   - Identify high-cost resources
   - Adjust pricing for future jobs

## Future Enhancements

Potential additions:
- Overhead cost allocation (rent, utilities, admin)
- Time tracking integration
- Real-time GPS tracking for equipment
- Photo evidence of materials used
- Automated fuel consumption calculations
- Profitability reports and analytics
- Budget vs actual comparisons
- Cost forecasting based on historical data
