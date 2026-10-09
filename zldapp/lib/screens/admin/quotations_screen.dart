import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/index.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';
import '../../utils/pdf_helper.dart';
import '../../utils/whatsapp_helper.dart';

class QuotationsScreen extends StatefulWidget {
  const QuotationsScreen({super.key});
  @override
  State<QuotationsScreen> createState() => _QuotationsScreenState();
}

class _QuotationsScreenState extends State<QuotationsScreen> {
  List<Quotation> _quotations = [];
  bool _loading = true;

  /// Tracks which quotation id is currently generating a PDF.
  String? _downloadingId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await SupabaseService.getQuotations();
      if (mounted) setState(() { _quotations = data; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  // ── PDF download ────────────────────────────────────────────────────────────
  Future<void> _downloadPdf(Quotation q) async {
    if (_downloadingId != null) return; // already generating one
    setState(() => _downloadingId = q.id);
    try {
      await downloadQuotationPdf(q);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to generate PDF: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _downloadingId = null);
    }
  }

  // ── WhatsApp share ──────────────────────────────────────────────────────────
  Future<void> _shareViaWhatsApp(Quotation q) async {
    try {
      // Get customer details from booking
      final bookingData = await SupabaseService.supabase
          .from('bookings')
          .select('customer:customer_id(*)')
          .eq('id', q.bookingId)
          .single();
      
      final customer = bookingData['customer'];
      
      await WhatsAppHelper.shareQuotation(
        quotationId: q.id,
        quotationNumber: q.quotationNumber,
        customerName: customer['name'] ?? 'Customer',
        customerPhone: customer['phone'],
        totalAmount: q.finalAmount,
        validUntil: q.validUntil != null 
            ? DateFormat('MMM d, yyyy').format(q.validUntil!)
            : 'N/A',
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Opening WhatsApp...'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // ── Create quotation ────────────────────────────────────────────────────────
  Future<void> _showCreateQuotationForm() async {
    final customers = await SupabaseService.getCustomers();
    final services = await SupabaseService.getServices(activeOnly: true);
    if (!mounted) return;

    String? customerId;
    String? serviceId;
    double totalAmount = 0.0;
    double taxRate = 10.0;
    double discount = 0.0;
    String validUntil =
        DateTime.now().add(const Duration(days: 30)).toIso8601String().substring(0, 10);
    String description = '';
    // ignore: unused_local_variable
    String notes = '';

    final saved = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Create Quotation'),
        content: SingleChildScrollView(
          child: StatefulBuilder(
            builder: (context, setState) {
              double tax = (totalAmount * taxRate) / 100;
              double finalAmount = totalAmount + tax - discount;
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  DropdownButtonFormField<String>(
                    value: customerId,
                    decoration:
                        const InputDecoration(labelText: 'Customer *', isDense: true),
                    items: customers
                        .map((c) => DropdownMenuItem(
                            value: c.id, child: Text('${c.name} - ${c.phone}')))
                        .toList(),
                    onChanged: (v) => setState(() => customerId = v),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: serviceId,
                    decoration:
                        const InputDecoration(labelText: 'Service *', isDense: true),
                    items: services
                        .map((s) => DropdownMenuItem(
                            value: s.id,
                            child: Text(
                                '${s.name} - RWF ${NumberFormat('#,##0').format(s.basePrice)}')))
                        .toList(),
                    onChanged: (v) {
                      final service = services.firstWhere((s) => s.id == v);
                      setState(() {
                        serviceId = v;
                        totalAmount = service.basePrice;
                        description = service.description ?? '';
                      });
                    },
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    decoration:
                        const InputDecoration(labelText: 'Description', isDense: true),
                    maxLines: 2,
                    onChanged: (v) => description = v,
                    controller: TextEditingController(text: description),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    decoration:
                        const InputDecoration(labelText: 'Amount (RWF) *', isDense: true),
                    keyboardType: TextInputType.number,
                    onChanged: (v) =>
                        setState(() => totalAmount = double.tryParse(v) ?? 0),
                    controller: TextEditingController(
                        text: totalAmount > 0 ? totalAmount.toString() : ''),
                  ),
                  const SizedBox(height: 12),
                  Row(children: [
                    Expanded(
                      child: TextField(
                        decoration:
                            const InputDecoration(labelText: 'Tax Rate (%)', isDense: true),
                        keyboardType: TextInputType.number,
                        onChanged: (v) =>
                            setState(() => taxRate = double.tryParse(v) ?? 0),
                        controller: TextEditingController(text: taxRate.toString()),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        decoration:
                            const InputDecoration(labelText: 'Discount (RWF)', isDense: true),
                        keyboardType: TextInputType.number,
                        onChanged: (v) =>
                            setState(() => discount = double.tryParse(v) ?? 0),
                        controller: TextEditingController(
                            text: discount > 0 ? discount.toString() : ''),
                      ),
                    ),
                  ]),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(children: [
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        const Text('Tax:', style: TextStyle(fontSize: 12)),
                        Text('RWF ${NumberFormat('#,##0.00').format(tax)}',
                            style: const TextStyle(fontSize: 12)),
                      ]),
                      const SizedBox(height: 4),
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        const Text('Final Amount:',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        Text('RWF ${NumberFormat('#,##0.00').format(finalAmount)}',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryColor)),
                      ]),
                    ]),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    decoration:
                        const InputDecoration(labelText: 'Valid Until *', isDense: true),
                    readOnly: true,
                    controller: TextEditingController(text: validUntil),
                    onTap: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now().add(const Duration(days: 30)),
                        firstDate: DateTime.now(),
                        lastDate:
                            DateTime.now().add(const Duration(days: 365)),
                      );
                      if (date != null) {
                        setState(() =>
                            validUntil = date.toIso8601String().substring(0, 10));
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    decoration:
                        const InputDecoration(labelText: 'Internal Notes', isDense: true),
                    maxLines: 2,
                    onChanged: (v) => notes = v,
                  ),
                ],
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () =>
                Navigator.of(dialogContext, rootNavigator: true).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (customerId == null || serviceId == null || totalAmount <= 0) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: Text('Please fill in all required fields'),
                    backgroundColor: Colors.red));
                return;
              }
              try {
                double tax = (totalAmount * taxRate) / 100;
                double finalAmount = totalAmount + tax - discount;

                final bookingData = await SupabaseService.createBooking({
                  'customer_id': customerId,
                  'service_id': serviceId,
                  'booking_date': DateTime.now().toIso8601String(),
                  'preferred_date':
                      DateTime.now().add(const Duration(days: 7)).toIso8601String(),
                  'status': 'pending',
                  'notes': 'Auto-created for quotation',
                });

                final quotationNumber =
                    'QUO-${DateTime.now().millisecondsSinceEpoch}';
                await SupabaseService.supabase.from('quotations').insert({
                  'booking_id': bookingData.id,
                  'quotation_number': quotationNumber,
                  'total_amount': totalAmount,
                  'tax': tax,
                  'discount': discount,
                  'final_amount': finalAmount,
                  'status': 'sent',
                  'valid_until': validUntil,
                });

                final quotationData = await SupabaseService.supabase
                    .from('quotations')
                    .select()
                    .eq('quotation_number', quotationNumber)
                    .single();

                await SupabaseService.supabase.from('quotation_items').insert({
                  'quotation_id': quotationData['id'],
                  'description': description.isEmpty
                      ? 'Service: ${services.firstWhere((s) => s.id == serviceId).name}'
                      : description,
                  'quantity': 1,
                  'unit_price': totalAmount,
                  'total_price': totalAmount,
                });

                Navigator.of(dialogContext, rootNavigator: true).pop(true);
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
    if (saved == true) _load();
  }

  // ── Detail bottom sheet ──────────────────────────────────────────────────────
  void _showDetail(Quotation q) {
    final fmt = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.65,
        maxChildSize: 0.92,
        builder: (_, ctrl) => ListView(
          controller: ctrl,
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 12),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text(q.quotationNumber,
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold)),
              StatusBadge(q.status),
            ]),
            const SizedBox(height: 4),
            Text(
                'Valid until: ${q.validUntil != null ? DateFormat('d MMM yyyy').format(q.validUntil!) : 'N/A'}',
                style: const TextStyle(color: Colors.black54)),
            const Divider(height: 24),
            ...q.items.map((item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(child: Text(item.description)),
                        Text(
                            '${item.quantity.toStringAsFixed(item.quantity % 1 == 0 ? 0 : 2)} x ${fmt.format(item.unitPrice)}'),
                        const SizedBox(width: 8),
                        Text(fmt.format(item.totalPrice),
                            style:
                                const TextStyle(fontWeight: FontWeight.w600)),
                      ]),
                )),
            const Divider(height: 24),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [const Text('Subtotal'), Text(fmt.format(q.totalAmount))]),
            if (q.discount > 0)
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('Discount'),
                Text('-${fmt.format(q.discount)}',
                    style: const TextStyle(color: Colors.green))
              ]),
            if (q.tax > 0)
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [const Text('Tax'), Text(fmt.format(q.tax))]),
            const Divider(),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              const Text('Total',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              Text(fmt.format(q.finalAmount),
                  style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: Color(0xFF1E40AF))),
            ]),
            if (q.termsAccepted) ...[
              const SizedBox(height: 12),
              const Row(children: [
                Icon(Icons.check_circle, color: Colors.green, size: 16),
                SizedBox(width: 4),
                Text('Terms accepted',
                    style: TextStyle(color: Colors.green))
              ]),
            ],
            const SizedBox(height: 20),
            // Action buttons
            Row(children: [
              // Download PDF button
              Expanded(
                child: StatefulBuilder(builder: (context, setSt) {
                  final isLoading = _downloadingId == q.id;
                  return ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: isLoading
                        ? null
                        : () async {
                            setSt(() {});
                            await _downloadPdf(q);
                            setSt(() {});
                          },
                    icon: isLoading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.download_rounded),
                    label: Text(isLoading ? 'Generating PDF…' : 'Download PDF'),
                  );
                }),
              ),
              const SizedBox(width: 10),
              // WhatsApp Share button
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366), // WhatsApp green
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    _shareViaWhatsApp(q);
                  },
                  icon: const Icon(Icons.share),
                  label: const Text('Share on WhatsApp'),
                ),
              ),
            ]),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateQuotationForm,
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Quotation'),
      ),
      body: _loading
          ? const LoadingWidget()
          : _quotations.isEmpty
              ? const EmptyWidget(
                  message: 'No quotations yet',
                  icon: Icons.request_quote_outlined)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: _quotations.length,
                    itemBuilder: (_, i) {
                      final q = _quotations[i];
                      final isDownloading = _downloadingId == q.id;
                      return Card(
                        margin: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 4),
                        child: ListTile(
                          onTap: () => _showDetail(q),
                          title: Text(q.quotationNumber),
                          subtitle: Text(
                              DateFormat('d MMM yyyy').format(q.createdAt)),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(fmt.format(q.finalAmount),
                                      style: const TextStyle(
                                          fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  StatusBadge(q.status),
                                ],
                              ),
                              const SizedBox(width: 8),
                              // Per-row download button
                              SizedBox(
                                width: 36,
                                height: 36,
                                child: isDownloading
                                    ? const Padding(
                                        padding: EdgeInsets.all(8),
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: AppTheme.primaryColor,
                                        ),
                                      )
                                    : IconButton(
                                        icon: const Icon(
                                            Icons.download_rounded,
                                            size: 20),
                                        color: AppTheme.primaryColor,
                                        padding: EdgeInsets.zero,
                                        tooltip: 'Download PDF',
                                        onPressed: () => _downloadPdf(q),
                                      ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
