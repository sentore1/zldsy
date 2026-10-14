import 'package:flutter/material.dart';
import '../../models/subscription.dart';
import '../../services/subscription_service.dart';
import '../../services/api_service.dart';

class SubscriptionFormScreen extends StatefulWidget {
  const SubscriptionFormScreen({Key? key}) : super(key: key);

  @override
  State<SubscriptionFormScreen> createState() => _SubscriptionFormScreenState();
}

class _SubscriptionFormScreenState extends State<SubscriptionFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  
  List<Map<String, dynamic>> _customers = [];
  List<SubscriptionPlan> _plans = [];
  
  String? _selectedCustomerId;
  String? _selectedPlanId;
  bool _useCustomPricing = false;
  
  final TextEditingController _customPriceController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  
  String _billingCycle = 'monthly';
  String _paymentMethod = 'cash';
  DateTime _startDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _customPriceController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);

    try {
      final customersResponse = await ApiService.get('/api/customers');
      final plansData = await SubscriptionService.getSubscriptionPlans(isActive: true);

      setState(() {
        _customers = List<Map<String, dynamic>>.from(customersResponse['customers'] ?? []);
        _plans = plansData;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading data: $e')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    // Validate: must have plan OR custom price
    if (!_useCustomPricing && _selectedPlanId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a plan or use custom pricing')),
      );
      return;
    }

    if (_useCustomPricing && _customPriceController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a custom price')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await SubscriptionService.createSubscription(
        customerId: _selectedCustomerId!,
        subscriptionPlanId: _useCustomPricing ? null : _selectedPlanId,
        customPrice: _useCustomPricing ? double.parse(_customPriceController.text) : null,
        billingCycle: _useCustomPricing ? _billingCycle : null,
        startDate: _startDate.toIso8601String(),
        paymentMethod: _paymentMethod,
        notes: _notesController.text,
      );

      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Subscription created successfully')),
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
        title: const Text('Create Subscription'),
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
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Customer Selection
                  DropdownButtonFormField<String>(
                    value: _selectedCustomerId,
                    decoration: const InputDecoration(
                      labelText: 'Customer *',
                      border: OutlineInputBorder(),
                    ),
                    items: _customers.map((customer) {
                      return DropdownMenuItem<String>(
                        value: customer['id'],
                        child: Text('${customer['name']} - ${customer['email']}'),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() => _selectedCustomerId = value);
                    },
                    validator: (value) => value == null ? 'Please select a customer' : null,
                  ),
                  const SizedBox(height: 16),

                  // Custom Pricing Toggle
                  SwitchListTile(
                    title: const Text('Use Custom Pricing'),
                    subtitle: const Text('Override plan pricing with a custom amount'),
                    value: _useCustomPricing,
                    onChanged: (value) {
                      setState(() => _useCustomPricing = value);
                    },
                  ),
                  const SizedBox(height: 16),

                  // Plan Selection OR Custom Price
                  if (!_useCustomPricing) ...[
                    DropdownButtonFormField<String>(
                      value: _selectedPlanId,
                      decoration: const InputDecoration(
                        labelText: 'Subscription Plan *',
                        border: OutlineInputBorder(),
                      ),
                      items: _plans.map((plan) {
                        return DropdownMenuItem<String>(
                          value: plan.id,
                          child: Text(
                            '${plan.name} - RWF ${plan.price.toStringAsFixed(0)} / ${plan.billingCycle}',
                          ),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() => _selectedPlanId = value);
                      },
                    ),
                  ] else ...[
                    // Custom Price Input
                    TextFormField(
                      controller: _customPriceController,
                      decoration: const InputDecoration(
                        labelText: 'Custom Price *',
                        hintText: 'Enter amount',
                        prefixText: 'RWF ',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (_useCustomPricing && (value == null || value.isEmpty)) {
                          return 'Please enter a price';
                        }
                        if (value != null && value.isNotEmpty) {
                          if (double.tryParse(value) == null) {
                            return 'Please enter a valid number';
                          }
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Billing Cycle
                    DropdownButtonFormField<String>(
                      value: _billingCycle,
                      decoration: const InputDecoration(
                        labelText: 'Billing Cycle',
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
                  ],
                  const SizedBox(height: 16),

                  // Start Date
                  ListTile(
                    title: const Text('Start Date'),
                    subtitle: Text(
                      '${_startDate.year}-${_startDate.month.toString().padLeft(2, '0')}-${_startDate.day.toString().padLeft(2, '0')}',
                    ),
                    trailing: const Icon(Icons.calendar_today),
                    onTap: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: _startDate,
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 365)),
                      );
                      if (date != null) {
                        setState(() => _startDate = date);
                      }
                    },
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                      side: BorderSide(color: Colors.grey[400]!),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Payment Method
                  DropdownButtonFormField<String>(
                    value: _paymentMethod,
                    decoration: const InputDecoration(
                      labelText: 'Payment Method',
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'cash', child: Text('Cash')),
                      DropdownMenuItem(value: 'bank_transfer', child: Text('Bank Transfer')),
                      DropdownMenuItem(value: 'mobile_money', child: Text('Mobile Money')),
                      DropdownMenuItem(value: 'card', child: Text('Card')),
                    ],
                    onChanged: (value) {
                      if (value != null) {
                        setState(() => _paymentMethod = value);
                      }
                    },
                  ),
                  const SizedBox(height: 16),

                  // Notes
                  TextFormField(
                    controller: _notesController,
                    decoration: const InputDecoration(
                      labelText: 'Notes',
                      hintText: 'Additional information...',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
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
                        : const Text(
                            'Create Subscription',
                            style: TextStyle(fontSize: 16),
                          ),
                  ),
                ],
              ),
            ),
    );
  }
}
