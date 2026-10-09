import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../services/supabase_service.dart';
import '../../widgets/common.dart';
import '../../theme.dart';

class QuotationViewScreen extends StatefulWidget {
  final String id;
  const QuotationViewScreen({super.key, required this.id});
  @override
  State<QuotationViewScreen> createState() => _QuotationViewScreenState();
}

class _QuotationViewScreenState extends State<QuotationViewScreen> {
  dynamic _quotation;
  bool _loading = true;
  bool _termsAccepted = false;
  bool _accepting = false;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final q = await SupabaseService.getQuotation(widget.id);
      if (mounted) setState(() { _quotation = q; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _accept() async {
    if (!_termsAccepted) return;
    setState(() => _accepting = true);
    try {
      await SupabaseService.acceptQuotation(widget.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Quotation accepted!'), backgroundColor: Colors.green));
        _load();
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _accepting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat.currency(symbol: 'RWF ', decimalDigits: 2);
    return Scaffold(
      appBar: AppBar(title: const Text('Quotation'), leading: BackButton(onPressed: () => context.go('/customer'))),
      body: _loading
          ? const LoadingWidget()
          : _quotation == null
              ? const EmptyWidget(message: 'Quotation not found')
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                              Text(_quotation.quotationNumber, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              StatusBadge(_quotation.status),
                            ]),
                            if (_quotation.validUntil != null) ...[
                              const SizedBox(height: 4),
                              Text('Valid until: ${DateFormat('d MMM yyyy').format(_quotation.validUntil!)}', style: const TextStyle(color: Colors.black54)),
                            ],
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Items', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            const Divider(),
                            ..._quotation.items.map((item) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              child: Row(children: [
                                Expanded(child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.description),
                                    Text('${item.quantity} x ${fmt.format(item.unitPrice)}', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                                  ],
                                )),
                                Text(fmt.format(item.totalPrice), style: const TextStyle(fontWeight: FontWeight.w600)),
                              ]),
                            )),
                            const Divider(),
                            if (_quotation.discount > 0) Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Discount'), Text('-${fmt.format(_quotation.discount)}', style: const TextStyle(color: Colors.green))]),
                            if (_quotation.tax > 0) Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Tax'), Text(fmt.format(_quotation.tax))]),
                            const SizedBox(height: 4),
                            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                              const Text('Total', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              Text(fmt.format(_quotation.finalAmount), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.primaryColor)),
                            ]),
                          ],
                        ),
                      ),
                    ),
                    if (_quotation.status == 'sent') ...[
                      const SizedBox(height: 16),
                      CheckboxListTile(
                        value: _termsAccepted,
                        onChanged: (v) => setState(() => _termsAccepted = v ?? false),
                        title: const Text('I accept the terms and conditions'),
                        controlAffinity: ListTileControlAffinity.leading,
                        contentPadding: EdgeInsets.zero,
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: (_termsAccepted && !_accepting) ? _accept : null,
                          child: _accepting
                              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Text('Accept Quotation'),
                        ),
                      ),
                    ],
                    if (_quotation.termsAccepted) ...[
                      const SizedBox(height: 12),
                      const Row(children: [
                        Icon(Icons.check_circle, color: Colors.green),
                        SizedBox(width: 8),
                        Text('You have accepted this quotation', style: TextStyle(color: Colors.green, fontWeight: FontWeight.w600)),
                      ]),
                    ],
                  ],
                ),
    );
  }
}
