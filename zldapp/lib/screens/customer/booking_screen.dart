import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'dart:io';
import '../../models/index.dart';
import '../../services/supabase_service.dart';
import '../../services/booking_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});
  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _address = TextEditingController();
  final _notes = TextEditingController();

  List<Service> _services = [];
  Service? _selectedService;
  DateTime? _preferredDate;
  List<XFile> _photos = [];
  bool _loading = false;
  bool _servicesLoading = true;
  int _step = 1; // 1-based indexing to match web app
  bool _agreedToTerms = false; // Default to false (unchecked) - user must explicitly agree

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _email.dispose();
    _address.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _loadServices() async {
    try {
      final data = await SupabaseService.getServices(activeOnly: true);
      if (mounted) {
        setState(() {
          _services = data;
          _servicesLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _servicesLoading = false);
        _showError('Failed to load services: ${e.toString()}');
      }
    }
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );
    if (picked != null) setState(() => _preferredDate = picked);
  }

  Future<void> _pickPhotos() async {
    final picker = ImagePicker();
    final photos = await picker.pickMultiImage();
    if (photos.isNotEmpty) {
      setState(() => _photos = [..._photos, ...photos]);
    }
  }

  void _removePhoto(int index) {
    setState(() => _photos.removeAt(index));
  }

  Future<void> _submit() async {
    print('🚀 Submit button pressed!');
    print('📋 Terms agreed: $_agreedToTerms');
    
    // Check if terms are agreed
    if (!_agreedToTerms) {
      print('❌ Terms not agreed');
      _showError('Please agree to the Terms and Conditions to continue');
      return;
    }

    print('✅ Starting booking submission...');
    setState(() => _loading = true);
    try {
      // Upload photos first if any
      List<String> photoUrls = [];
      if (_photos.isNotEmpty) {
        // TODO: Implement photo upload to Supabase storage
        print('📸 Photos selected: ${_photos.length}');
      }

      print('📡 Calling API endpoint...');
      print('🔗 Service ID: ${_selectedService!.id}');
      print('📅 Preferred Date: ${_preferredDate!.toIso8601String()}');
      print('👤 Customer Name: ${_name.text}');
      
      // Create booking via API endpoint (bypasses RLS using service role)
      final booking = await BookingService.createBooking(
        serviceId: _selectedService!.id,
        preferredDate: _preferredDate!.toIso8601String(),
        notes: _notes.text.isEmpty ? null : _notes.text,
        customerInfo: {
          'name': _name.text,
          'email': _email.text.isEmpty ? null : _email.text,
          'phone': _phone.text,
          'address': _address.text,
        },
      );

      print('✅ Booking created successfully: ${booking['id']}');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Booking submitted successfully!'),
            backgroundColor: Color(0xFF16A34A),
            duration: Duration(seconds: 3),
          ),
        );
        context.go('/customer/track?booking=${booking['id']}');
      }
    } catch (e) {
      print('❌ Booking submission error: $e');
      if (mounted) {
        _showError('Failed to submit booking: ${e.toString()}');
      }
    } finally {
      if (mounted) {
        print('🔄 Resetting loading state');
        setState(() => _loading = false);
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppTheme.errorColor),
    );
  }

  bool _validateStep1() {
    return _selectedService != null &&
        _name.text.isNotEmpty &&
        _phone.text.isNotEmpty &&
        _address.text.isNotEmpty &&
        _preferredDate != null;
  }

  void _nextStep() {
    if (_step == 1) {
      if (!_validateStep1()) {
        _showError('Please fill all required fields');
        return;
      }
      setState(() => _step = 2);
    } else if (_step == 2) {
      setState(() => _step = 3);
    } else if (_step == 3) {
      _submit();
    }
  }

  void _previousStep() {
    if (_step > 1) {
      setState(() => _step--);
    } else {
      context.go('/customer');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgColor,
      appBar: AppBar(
        title: const Text('Book a Service'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/customer'),
        ),
      ),
      body: SingleChildScrollView(
        child: Center(
          child: Container(
            constraints: const BoxConstraints(maxWidth: 800),
            margin: const EdgeInsets.all(16),
            child: Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildProgressIndicator(),
                    const SizedBox(height: 32),
                    if (_step == 1) _buildStep1(),
                    if (_step == 2) _buildStep2(),
                    if (_step == 3) _buildStep3(),
                    const SizedBox(height: 24),
                    _buildNavigationButtons(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Row(
      children: [
        _buildStepIndicator(1, 'Service & Details', _step >= 1, _step > 1),
        Expanded(
          child: Container(
            height: 2,
            margin: const EdgeInsets.symmetric(horizontal: 8),
            color: _step > 1 ? AppTheme.primaryColor : Colors.grey[300],
          ),
        ),
        _buildStepIndicator(2, 'Upload Photos', _step >= 2, _step > 2),
        Expanded(
          child: Container(
            height: 2,
            margin: const EdgeInsets.symmetric(horizontal: 8),
            color: _step > 2 ? AppTheme.primaryColor : Colors.grey[300],
          ),
        ),
        _buildStepIndicator(3, 'Review & Confirm', _step >= 3, false),
      ],
    );
  }

  Widget _buildStepIndicator(int number, String title, bool active, bool completed) {
    return Column(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: completed || active ? AppTheme.primaryColor : Colors.grey[300],
          ),
          child: Center(
            child: completed
                ? const Icon(Icons.check, color: Colors.white, size: 24)
                : Text(
                    number.toString(),
                    style: TextStyle(
                      color: active || completed ? Colors.white : Colors.grey[600],
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          width: 100,
          child: Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: active ? Colors.black87 : Colors.grey[600],
              fontWeight: active ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStep1() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Service Selection
          const Text(
            'Select Service *',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.black87),
          ),
          const SizedBox(height: 8),
          _servicesLoading
              ? const Center(child: CircularProgressIndicator())
              : DropdownButtonFormField<Service>(
                  decoration: InputDecoration(
                    hintText: 'Choose a service',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  value: _selectedService,
                  items: _services.map((service) {
                    return DropdownMenuItem(
                      value: service,
                      child: Text(
                        '${service.name} - RWF ${service.basePrice.toStringAsFixed(0)} / ${service.unit}',
                        style: const TextStyle(fontSize: 14),
                      ),
                    );
                  }).toList(),
                  onChanged: (value) => setState(() => _selectedService = value),
                  validator: (value) => value == null ? 'Please select a service' : null,
                ),
          const SizedBox(height: 20),

          // Name and Phone Row
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.person, size: 16, color: Colors.black87),
                        SizedBox(width: 4),
                        Text('Full Name *', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _name,
                      decoration: InputDecoration(
                        hintText: 'John Doe',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.phone, size: 16, color: Colors.black87),
                        SizedBox(width: 4),
                        Text('Phone Number *', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _phone,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        hintText: '+250 7XX XXX XXX',
                        helperText: 'Use format: +250 7XX XXX XXX for tracking',
                        helperStyle: TextStyle(fontSize: 11, color: Colors.grey[600]),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Email
          const Row(
            children: [
              Icon(Icons.email, size: 16, color: Colors.black87),
              SizedBox(width: 4),
              Text('Email Address', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
            ],
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _email,
            keyboardType: TextInputType.emailAddress,
            decoration: InputDecoration(
              hintText: 'john@example.com',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
          ),
          const SizedBox(height: 20),

          // Address
          const Row(
            children: [
              Icon(Icons.location_on, size: 16, color: Colors.black87),
              SizedBox(width: 4),
              Text('Service Address *', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
            ],
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _address,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Enter complete address',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
          ),
          const SizedBox(height: 20),

          // Preferred Date
          const Row(
            children: [
              Icon(Icons.calendar_today, size: 16, color: Colors.black87),
              SizedBox(width: 4),
              Text('Preferred Date *', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
            ],
          ),
          const SizedBox(height: 8),
          InkWell(
            onTap: _pickDate,
            child: InputDecorator(
              decoration: InputDecoration(
                hintText: 'Select date',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _preferredDate == null
                        ? 'Select date'
                        : DateFormat('yyyy-MM-dd').format(_preferredDate!),
                    style: TextStyle(
                      color: _preferredDate == null ? Colors.grey[600] : Colors.black87,
                      fontSize: 14,
                    ),
                  ),
                  const Icon(Icons.calendar_today, size: 18, color: Colors.grey),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Additional Notes
          const Text(
            'Additional Notes',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.black87),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _notes,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Any special requirements or instructions',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    return Column(
      children: [
        Icon(Icons.upload_file, size: 64, color: AppTheme.primaryColor),
        const SizedBox(height: 16),
        const Text(
          'Upload Photos (Optional)',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
        ),
        const SizedBox(height: 8),
        Text(
          'Upload photos of the area/items that need service.\nThis helps us provide accurate quotations.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
        ),
        const SizedBox(height: 24),

        // Upload Area
        InkWell(
          onTap: _pickPhotos,
          child: Container(
            padding: const EdgeInsets.all(40),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!, width: 2, style: BorderStyle.solid),
              borderRadius: BorderRadius.circular(12),
              color: Colors.white,
            ),
            child: Column(
              children: [
                Icon(Icons.cloud_upload, size: 48, color: Colors.grey[400]),
                const SizedBox(height: 16),
                const Text(
                  'Click to upload or drag and drop',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.black87),
                ),
                const SizedBox(height: 8),
                Text(
                  'PNG, JPG, JPEG up to 10MB each',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),

        // Uploaded Photos List
        if (_photos.isNotEmpty) ...[
          Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Uploaded Photos (${_photos.length})',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.black87),
            ),
          ),
          const SizedBox(height: 12),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _photos.length,
            itemBuilder: (context, index) {
              final photo = _photos[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: const Icon(Icons.image, color: Colors.grey),
                  title: Text(
                    photo.name,
                    style: const TextStyle(fontSize: 14),
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.close, color: Colors.red),
                    onPressed: () => _removePhoto(index),
                  ),
                ),
              );
            },
          ),
        ],
      ],
    );
  }

  Widget _buildStep3() {
    final selectedService = _services.firstWhere((s) => s.id == _selectedService?.id, orElse: () => _selectedService!);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Review Your Booking',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
        ),
        const SizedBox(height: 24),

        // Review Details Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(child: _buildReviewRow('Service', selectedService.name)),
                  const SizedBox(width: 16),
                  Expanded(child: _buildReviewRow('Preferred Date', DateFormat('yyyy-MM-dd').format(_preferredDate!))),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildReviewRow('Customer Name', _name.text)),
                  const SizedBox(width: 16),
                  Expanded(child: _buildReviewRow('Phone', _phone.text)),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_email.text.isNotEmpty)
                    Expanded(child: _buildReviewRow('Email', _email.text))
                  else
                    const Expanded(child: SizedBox()),
                  const SizedBox(width: 16),
                  Expanded(child: _buildReviewRow('Address', _address.text)),
                ],
              ),
              if (_notes.text.isNotEmpty || _photos.isNotEmpty) ...[
                const SizedBox(height: 16),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_notes.text.isNotEmpty)
                      Expanded(child: _buildReviewRow('Notes', _notes.text))
                    else
                      const Expanded(child: SizedBox()),
                    const SizedBox(width: 16),
                    if (_photos.isNotEmpty)
                      Expanded(child: _buildReviewRow('Photos Uploaded', '${_photos.length} file(s)'))
                    else
                      const Expanded(child: SizedBox()),
                  ],
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Terms and Conditions Checkbox
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Checkbox(
                value: _agreedToTerms,
                onChanged: (value) {
                  setState(() => _agreedToTerms = value ?? false);
                },
                activeColor: AppTheme.primaryColor,
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => _showTermsAndConditionsDialog(),
                  child: RichText(
                    text: TextSpan(
                      style: const TextStyle(fontSize: 14, color: Colors.black87),
                      children: [
                        const TextSpan(text: 'I agree to the '),
                        TextSpan(
                          text: 'Terms and Conditions',
                          style: const TextStyle(
                            color: AppTheme.primaryColor,
                            fontWeight: FontWeight.w600,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                        const TextSpan(text: ' *'),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildReviewRow(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
        ),
      ],
    );
  }

  Widget _buildNavigationButtons() {
    if (_step == 1) {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: _nextStep,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primaryColor,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          child: const Text(
            'Continue to Upload Photos',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
          ),
        ),
      );
    }

    // For steps 2 and 3
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: _previousStep,
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              side: BorderSide(color: Colors.grey[300]!),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text(
              'Back',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.black87),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: ElevatedButton(
            onPressed: _loading ? null : _nextStep,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: _loading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                  )
                : Text(
                    _step == 3 ? 'Submit Booking' : 'Continue',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
                  ),
          ),
        ),
      ],
    );
  }

  void _showTermsAndConditionsDialog() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 600, maxHeight: 700),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: AppTheme.primaryColor,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.description, color: Colors.white, size: 28),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'Terms and Conditions',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              
              // Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildTermSection(
                        '1. Service Agreement',
                        'By booking our cleaning services, you agree to allow our professional staff to access the designated service area at the scheduled time. You are responsible for ensuring safe access to the property.',
                      ),
                      _buildTermSection(
                        '2. Pricing and Quotations',
                        'All prices are quoted in Rwandan Francs (RWF). Initial quotations are estimates based on the information provided. Final pricing may vary based on actual service requirements, area size, and condition. Any changes will be communicated before service commencement.',
                      ),
                      _buildTermSection(
                        '3. Payment Terms',
                        'Payment is due upon service completion unless otherwise agreed. We accept cash and mobile money (MTN Mobile Money, Airtel Money).\n\n'
                        'Invoices will be provided electronically. Late payments beyond the agreed payment date will incur a penalty of 5% per day until full payment is received.',
                      ),
                      _buildTermSection(
                        '4. Cancellation Policy',
                        'Cancellation must be made in writing (email, SMS, or through our app):\n\n'
                        '• More than 48 hours before scheduled service: No charge\n'
                        '• 24-48 hours before scheduled service: 50% cancellation fee will apply\n'
                        '• Less than 24 hours before scheduled service: 100% cancellation fee (full service charge)\n\n'
                        'We reserve the right to cancel services due to unforeseen circumstances (severe weather, emergencies, etc.) with full refund. You will be notified immediately and offered alternative dates.',
                      ),
                      _buildTermSection(
                        '5. Rescheduling',
                        'Services may be rescheduled up to 24 hours before the scheduled time without penalty. Please contact us as soon as possible to arrange a new time.',
                      ),
                      _buildTermSection(
                        '6. Service Guarantee',
                        'We stand behind the quality of our work. If you are not satisfied with any aspect of our service, or if something has been lost or damaged, you must notify us within 24 hours of service completion. We will return to address the issue at no additional charge.\n\n'
                        'IMPORTANT: Any claims for lost items, damages, or service quality issues NOT reported within 24 hours will not be considered. After 24 hours, the service will be deemed accepted and satisfactory.',
                      ),
                      _buildTermSection(
                        '7. Liability and Insurance',
                        'We maintain comprehensive liability insurance. However, we are not responsible for:\n• Pre-existing damage not reported before service\n• Damage to items not properly secured\n• Items of unusual value unless specifically declared\n• Loss of items valued over RWF 50,000 unless declared',
                      ),
                      _buildTermSection(
                        '8. Customer Responsibilities',
                        'You agree to:\n'
                        '• Provide accurate service location and contact information\n'
                        '• Secure valuable or fragile items before service\n'
                        '• Inform us of any special requirements or hazards\n'
                        '• Ensure pets are secured during service\n'
                        '• Provide access to water and electricity as needed\n\n'
                        'IMPORTANT - Property Security:\n'
                        '• The customer MUST provide a supervisor or responsible person to be present during service and to secure valuable properties\n'
                        '• If valuable items are lost or damaged WITHOUT the presence of your designated supervisor, ZLD Hub will NOT be held responsible for the loss\n'
                        '• Items of high value (jewelry, electronics, cash, important documents) must be secured by the customer before service begins\n'
                        '• Our staff will not be held liable for losses that occur due to inadequate supervision by the customer',
                      ),
                      _buildTermSection(
                        '9. Privacy and Data Protection',
                        'We collect and process your personal information in accordance with Rwanda\'s data protection laws. Your data is used solely for service delivery, communication, and record keeping. We do not share your information with third parties without consent.',
                      ),
                      _buildTermSection(
                        '10. Health and Safety',
                        'Our staff follow strict health and safety protocols. We use professional-grade, eco-friendly cleaning products. If you have allergies or sensitivities, please inform us in advance so we can accommodate your needs.',
                      ),
                      _buildTermSection(
                        '11. Service Scope',
                        'Each service has a defined scope. Additional services beyond the original booking may incur extra charges. Our staff will communicate any recommendations or additional work required.',
                      ),
                      _buildTermSection(
                        '12. Force Majeure',
                        'We are not liable for delays or failures in service delivery due to circumstances beyond our control including natural disasters, government restrictions, or other force majeure events.',
                      ),
                      _buildTermSection(
                        '13. Dispute Resolution',
                        'Any disputes arising from our services will be resolved through good faith negotiation. If unresolved, disputes shall be subject to the jurisdiction of Rwanda courts.',
                      ),
                      _buildTermSection(
                        '14. Terms Modification',
                        'We reserve the right to modify these terms at any time. Changes will be effective upon posting to our website or app. Continued use of our services constitutes acceptance of modified terms.',
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Last Updated: ${DateFormat('MMMM dd, yyyy').format(DateTime.now())}',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600], fontStyle: FontStyle.italic),
                      ),
                    ],
                  ),
                ),
              ),
              
              // Footer Actions
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: BorderSide(color: Colors.grey[300]!),
                        ),
                        child: const Text('Close'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          setState(() => _agreedToTerms = true);
                          Navigator.pop(context);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryColor,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: const Text('I Agree', style: TextStyle(color: Colors.white)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTermSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[700],
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
