import 'package:flutter/material.dart';
import '../../models/subscription.dart';
import '../../services/subscription_service.dart';
import '../../services/api_service.dart';

class SubscriptionPlanFormScreen extends StatefulWidget {
  final SubscriptionPlan? plan;

  const SubscriptionPlanFormScreen({Key? key, this.plan}) : super(key: key);

  @override
  State<SubscriptionPlanFormScreen> createState() =>
      _SubscriptionPlanFormScreenState();
}

class _SubscriptionPlanFormScreenState
    extends State<SubscriptionPlanFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  List<Map<String, dynamic>> _services = [];

  // Form fields
  late TextEditingController _nameController;
  late TextEditingController _descriptionController;
  late TextEditingController _priceController;
  late TextEditingController _setupFeeController;
  late TextEditingController _includedVisitsController;
  late TextEditingController _visitDurationController;
  late TextEditingController _discountController;
  late TextEditingController _displayOrderController;

  String? _selectedServiceId;
  String _billingCycle = 'monthly';
  String _priorityLevel = 'standard';
  bool _isActive = true;
  bool _isFeatured = false;

  @override
  void initState() {
    super.initState();
    _initializeControllers();
    _loadServices();
  }

  void _initializeControllers() {
    final plan = widget.plan;

    _nameController = TextEditingController(text: plan?.name ?? '');
    _descriptionController =
        TextEditingController(text: plan?.description ?? '');
    _priceController =
        TextEditingController(text: plan?.price.toString() ?? '');
    _setupFeeController =
        TextEditingController(text: plan?.setupFee.toString() ?? '0');
    _includedVisitsController =
        TextEditingController(text: plan?.includedVisits?.toString() ?? '');
    _visitDurationController =
        TextEditingController(text: plan?.visitDuration?.toString() ?? '120');
    _discountController = TextEditingController(
        text: plan?.discountPercentage.toString() ?? '0');
    _displayOrderController =
        TextEditingController(text: plan?.displayOrder.toString() ?? '0');

    if (plan != null) {
      _selectedServiceId = plan.serviceId;
      _billingCycle = plan.billingCycle;
      _priorityLevel = plan.priorityLevel;
      _isActive = plan.isActive;
      _isFeatured = plan.isFeatured;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _setupFeeController.dispose();
    _includedVisitsController.dispose();
    _visitDurationController.dispose();
    _discountController.dispose();
    _displayOrderController.dispose();
    super.dispose();
  }

  Future<void> _loadServices() async {
    try {
      final response = await ApiService.get('/api/services?active=true');
      if (response['services'] != null) {
        setState(() {
          _services = List<Map<String, dynamic>>.from(response['services']);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading services: $e')),
        );
      }
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final data = {
        'name': _nameController.text.trim(),
        'description': _descriptionController.text.trim(),
        'service_id': _selectedServiceId,
        'billing_cycle': _billingCycle,
        'price': double.parse(_priceController.text),
        'setup_fee': double.parse(_setupFeeController.text),
        'included_visits': _includedVisitsController.text.isNotEmpty
            ? int.parse(_includedVisitsController.text)
            : null,
        'visit_duration': _visitDurationController.text.isNotEmpty
            ? int.parse(_visitDurationController.text)
            : null,
        'priority_level': _priorityLevel,
        'discount_percentage': double.parse(_discountController.text),
        'is_active': _isActive,
        'is_featured': _isFeatured,
        'display_order': int.parse(_displayOrderController.text),
      };

      if (widget.plan != null) {
        // Update existing plan
        await SubscriptionService.updateSubscriptionPlan(widget.plan!.id, data);
      } else {
        // Create new plan
        await SubscriptionService.createSubscriptionPlan(data);
      }

      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.plan != null
                  ? 'Plan updated successfully'
                  : 'Plan created successfully',
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.plan != null ? 'Edit Plan' : 'New Plan'),
        actions: [
          if (_isLoading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            )
          else
            IconButton(
              icon: const Icon(Icons.check),
              onPressed: _handleSubmit,
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Plan Name
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Plan Name *',
                hintText: 'e.g., Weekly Premium Cleaning',
                border: OutlineInputBorder(),
              ),
              validator: (value) =>
                  value?.isEmpty ?? true ? 'Please enter a plan name' : null,
            ),
            const SizedBox(height: 16),

            // Description
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Description',
                hintText: 'Describe the plan...',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),

            // Service Selection
            DropdownButtonFormField<String>(
              value: _selectedServiceId,
              decoration: const InputDecoration(
                labelText: 'Service',
                hintText: 'Select a service',
                helperText: 'Select which service this plan applies to',
                border: OutlineInputBorder(),
              ),
              items: [
                const DropdownMenuItem<String>(
                  value: null,
                  child: Text('All Services'),
                ),
                ..._services.map((service) {
                  return DropdownMenuItem<String>(
                    value: service['id'],
                    child: Text(
                      '${service['name']} - \$${(service['base_price'] ?? 0).toStringAsFixed(2)}',
                    ),
                  );
                }),
              ],
              onChanged: (value) {
                setState(() => _selectedServiceId = value);
              },
            ),
            const SizedBox(height: 16),

            // Billing Cycle
            DropdownButtonFormField<String>(
              value: _billingCycle,
              decoration: const InputDecoration(
                labelText: 'Billing Cycle *',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'weekly', child: Text('Weekly')),
                DropdownMenuItem(value: 'monthly', child: Text('Monthly')),
                DropdownMenuItem(value: 'yearly', child: Text('Yearly')),
                DropdownMenuItem(value: 'permanent', child: Text('Permanent')),
              ],
              onChanged: (value) {
                if (value != null) {
                  setState(() => _billingCycle = value);
                }
              },
            ),
            const SizedBox(height: 16),

            // Price
            TextFormField(
              controller: _priceController,
              decoration: const InputDecoration(
                labelText: 'Price *',
                prefixText: '\$ ',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.numberWithOptions(decimal: true),
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Please enter a price';
                if (double.tryParse(value!) == null) {
                  return 'Please enter a valid number';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Setup Fee
            TextFormField(
              controller: _setupFeeController,
              decoration: const InputDecoration(
                labelText: 'Setup Fee',
                prefixText: '\$ ',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 16),

            // Included Visits
            TextFormField(
              controller: _includedVisitsController,
              decoration: const InputDecoration(
                labelText: 'Included Visits',
                hintText: 'Leave empty for unlimited',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),

            // Visit Duration
            TextFormField(
              controller: _visitDurationController,
              decoration: const InputDecoration(
                labelText: 'Visit Duration (minutes)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),

            // Priority Level
            DropdownButtonFormField<String>(
              value: _priorityLevel,
              decoration: const InputDecoration(
                labelText: 'Priority Level',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'standard', child: Text('Standard')),
                DropdownMenuItem(value: 'priority', child: Text('Priority')),
                DropdownMenuItem(value: 'urgent', child: Text('Urgent')),
              ],
              onChanged: (value) {
                if (value != null) {
                  setState(() => _priorityLevel = value);
                }
              },
            ),
            const SizedBox(height: 16),

            // Discount Percentage
            TextFormField(
              controller: _discountController,
              decoration: const InputDecoration(
                labelText: 'Discount (%)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 16),

            // Display Order
            TextFormField(
              controller: _displayOrderController,
              decoration: const InputDecoration(
                labelText: 'Display Order',
                helperText: 'Lower numbers appear first',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),

            // Active Switch
            SwitchListTile(
              title: const Text('Active'),
              subtitle: const Text('Make this plan available'),
              value: _isActive,
              onChanged: (value) {
                setState(() => _isActive = value);
              },
            ),

            // Featured Switch
            SwitchListTile(
              title: const Text('Featured'),
              subtitle: const Text('Highlight this plan'),
              value: _isFeatured,
              onChanged: (value) {
                setState(() => _isFeatured = value);
              },
            ),

            const SizedBox(height: 32),

            // Submit Button
            ElevatedButton(
              onPressed: _isLoading ? null : _handleSubmit,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(
                      widget.plan != null ? 'Update Plan' : 'Create Plan',
                      style: const TextStyle(fontSize: 16),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
